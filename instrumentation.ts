export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log("🚀 Starting Redis email background worker...");
    
    const { getRedisClient } = await import('./utils/lib/redis');
    const { sendMail } = await import('./utils/sendMail');

    const startWorker = async () => {
      // Connect to redis inside the worker loop so it doesn't block server startup
      const redis = await getRedisClient();
      while (true) {
        try {
          const result = await redis.brPop('email_queue', 0);
          if (result) {
            const { element } = result;
            const emailData = JSON.parse(element);
            console.log(`[Worker] Processing email job for ${emailData.to}...`);
            await sendMail(emailData);
            console.log(`[Worker] Email job completed for ${emailData.to}`);
          }
        } catch (error) {
          console.error("[Worker] Redis error:", error);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    };

    startWorker();
  }
}
