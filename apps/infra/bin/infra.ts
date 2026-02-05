import { App } from 'aws-cdk-lib';
import { EvidenceBucketStack } from '../src/stacks/evidence-bucket-stack';
import { JobsQueueStack } from '../src/stacks/jobs-queue-stack';
import { WebCdnStack } from '../src/stacks/web-cdn-stack';
import { IngestLambdaStack } from '../src/stacks/ingest-lambda-stack';

const app = new App();

new EvidenceBucketStack(app, 'ChronosEvidenceBucketStack');
new JobsQueueStack(app, 'ChronosJobsQueueStack');
new WebCdnStack(app, 'ChronosWebCdnStack');
new IngestLambdaStack(app, 'ChronosIngestLambdaStack');
