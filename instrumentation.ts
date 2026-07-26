export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { redisClient } = await import('./utils/lib/redis');
    const { sendMail } = await import('./utils/sendMail');

    if (!redisClient.isOpen) {
      await redisClient.connect().catch(() => {});
    }

    console.log("🚀 Starting Redis email background worker...");

    const startWorker = async () => {
      while (true) {
        try {
          const result = await redisClient.brPop('email_queue', 0);
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
