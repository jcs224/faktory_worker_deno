import { Sha256 } from "https://deno.land/std@0.51.0/hash/sha256.ts";
import merge from "https://deno.land/x/lodash@4.17.15-es/merge.js";
import { FaktoryJob } from "./FaktoryJob.ts";

class FaktoryClient {
  #faktoryHost: string;
  #faktoryPort: number;
  #faktoryPassword?: string;
  #connection: Deno.Conn | null;

  constructor(host: string, port: number, password?: string) {
    this.#faktoryHost = host;
    this.#faktoryPort = port;
    this.#faktoryPassword = password;
    this.#connection = null;
  }

  async push<T>(job: FaktoryJob<T>) {
    await this.#writeLine("PUSH " + JSON.stringify(job));
  }

  async fetch(queues = ["default"]) {
    const response = await this.#writeLine("FETCH " + queues.join(" "));

    if (response.includes("jid") && !response.includes("$-1")) {
      const jobString = response.substring(
        response.indexOf("{"),
        response.lastIndexOf("}") + 1,
      );
      try {
        const parsedJob = JSON.parse(jobString);
        return parsedJob;
      } catch {
        return null;
      }
    } else {
      return null;
    }
  }

  async ack(jobId: string) {
    await this.#writeLine("ACK " + JSON.stringify({ jid: jobId }));
  }

  async fail(jobId: string, errorType = "Unknown", message = "Job failed.") {
    await this.#writeLine(
      "FAIL " + JSON.stringify({
        jid: jobId,
        errType: errorType,
        message: message,
      }),
    );
  }

  async connect() {
    const requestDefaults = { v: 2 };

    this.#connection = await Deno.connect({
      hostname: this.#faktoryHost,
      port: this.#faktoryPort,
    });

    const response = await this.#readLine();

    if (!response.includes("+HI")) {
      throw "HI not received.";
    }

    // if password required
    if (response.includes('"i":') && response.includes('"s":')) {
      if (!this.#faktoryPassword) {
        throw "Password is required.";
      }

      const payloadString = response.substring(
        response.indexOf("{"),
        response.lastIndexOf("}") + 1,
      );
      const payloadJSON = JSON.parse(payloadString);

      const sha = new Sha256();
      let authData = sha.update(this.#faktoryPassword + payloadJSON.s);
      for (let i = 1; i < payloadJSON.i; i++) {
        const iterSha = new Sha256();
        authData = iterSha.update(authData.digest());
      }
      const finalHex = authData.hex();
      merge(requestDefaults, { pwdhash: finalHex });
    }

    const passwordResponse = await this.#writeLine(
      "HELLO " + JSON.stringify(requestDefaults),
    );

    if (passwordResponse.includes("ERR Invalid password")) {
      throw "Password is incorrect.";
    }
  }

  close() {
    if (!this.#connection) {
      throw "Connection must be established beforehand.";
    }
    Deno.close(this.#connection.rid);
  }

  async #readLine() {
    if (!this.#connection) {
      throw "Connection must be established beforehand.";
    }
    const buf = new Uint8Array(4096);
    await Deno.read(this.#connection.rid, buf);
    const text = new TextDecoder().decode(buf);
    return text;
  }

  async #writeLine(stringPayload: string) {
    if (!this.#connection) {
      throw "Connection must be established beforehand.";
    }
    const payload = stringPayload + "\r\n";
    const encodedPayload = new TextEncoder().encode(payload);
    await Deno.write(this.#connection.rid, encodedPayload);
    const response = await this.#readLine();
    return response;
  }
}

export { FaktoryClient };
