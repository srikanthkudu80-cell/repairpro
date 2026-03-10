import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Scheduled function: runs every day at 7:45 AM UTC (adjust to local timezone).
 * Sends a push notification to every user who has jobs scheduled for today.
 *
 * Deploy: firebase deploy --only functions
 */
export const sendDailyJobDigest = functions.pubsub
  .schedule('45 7 * * *')
  .timeZone('America/New_York') // change to your target timezone
  .onRun(async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Get all users
    const usersSnap = await db.collection('users').get();

    const sendPromises = usersSnap.docs.map(async (userDoc: admin.firestore.QueryDocumentSnapshot) => {
      const userId = userDoc.id;
      const userData = userDoc.data();

      // Get today's jobs for this user
      const jobsSnap = await db
        .collection('users')
        .doc(userId)
        .collection('jobs')
        .where('scheduledDate', '>=', admin.firestore.Timestamp.fromDate(startOfDay))
        .where('scheduledDate', '<=', admin.firestore.Timestamp.fromDate(endOfDay))
        .where('status', 'in', ['new', 'in_progress', 'awaiting_parts'])
        .get();

      if (jobsSnap.empty) return;

      const jobCount = jobsSnap.size;
      const expoPushToken: string | undefined = userData.expoPushToken;

      if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken')) return;

      // Send via Expo Push API (no FCM server key needed for free tier)
      const message = {
        to: expoPushToken,
        title: "Good morning! 🔧",
        body: `You have ${jobCount} job${jobCount > 1 ? 's' : ''} scheduled for today.`,
        data: { screen: 'Dashboard' },
      };

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(message),
      });

      functions.logger.info(`Sent digest to user ${userId}: ${jobCount} jobs`);
    });

    await Promise.allSettled(sendPromises);
    functions.logger.info('Daily digest complete.');
    return null;
  });

/**
 * Firestore trigger: when a job is updated with a scheduledDate,
 * send a confirmation notification to the user.
 */
export const onJobCreated = functions.firestore
  .document('users/{userId}/jobs/{jobId}')
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const job = snap.data();
    const userId = context.params.userId;

    if (!job) return;

    const userDoc = await db.collection('users').doc(userId).get();
    const expoPushToken: string | undefined = userDoc.data()?.expoPushToken;

    if (!expoPushToken) return;

    const message = {
      to: expoPushToken,
      title: "New Job Created ✅",
      body: `Job for ${job.customerName} (${job.appliance}) has been created.`,
      data: { jobId: snap.id },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(message),
    });
  });
