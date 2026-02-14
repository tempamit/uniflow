import { claimQueuedEmailJob, markEmailJobFailed, markEmailJobSent } from './email.processor.repository.js';
import { sendVerificationEmail } from './mailer.service.js';

async function processOne() {
  const job = await claimQueuedEmailJob();
  if (!job) {
    return;
  }

  try {
    if (job.type === 'visitor_verification') {
      await sendVerificationEmail(job);
    }
    await markEmailJobSent(job.id);
  } catch (error) {
    await markEmailJobFailed(job.id, error.message);
  }
}

setInterval(() => {
  processOne().catch((error) => {
    console.error('Email worker loop failed', error);
  });
}, 2000);

console.log('Email worker started');
