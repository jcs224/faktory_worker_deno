import { FaktoryClient } from "./FaktoryClient.ts";

class FaktoryWorker {
  #client: FaktoryClient;
  #queues: string[];
  // deno-lint-ignore ban-types
  #jobTypes: Array<{ jobType: string; jobFunction: Function }>;
  #stop: boolean;

  constructor(client: FaktoryClient) {
    this.#client = client;
    this.#queues = ["default"];
    this.#jobTypes = [];
    this.#stop = false;
  }

  register<T = unknown>(jobType: string, callable: (args: T) => void) {
    this.#jobTypes.push({
      jobType: jobType,
      jobFunction: callable,
    });
  }

  async run(daemonize = false) {
    do {
      const inJob = await this.#client.fetch(this.#queues);

      if (inJob) {
        try {
          const [{ jobFunction }] = this.#jobTypes.filter((
            { jobType },
          ) => jobType == inJob.jobtype);
          jobFunction.call(this, inJob.args);
          await this.#client.ack(inJob.jid);
        } catch (err) {
          console.log(err);
          await this.#client.fail(inJob.jid, err.type, err.message);
        }
      }
    } while (daemonize && !this.#stop);
  }

  stop() {
    this.#stop = true;
  }
}

export { FaktoryWorker };
