import { FaktoryClient, FaktoryJob } from "../mod.ts";

function randomIntFromInterval(min: number, max: number) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// let client = new FaktoryClient('localhost', 7419, 'somepassword') // Example with password
const client = new FaktoryClient("localhost", 7419, "passthis");

await client.connect();

// Create job
const job = new FaktoryJob("adder", [
  randomIntFromInterval(1, 10),
  randomIntFromInterval(1, 10),
]);

// Push job
await client.push(job);

// Push another job
const job2 = new FaktoryJob("anotherjob", []);
await client.push(job2);

client.close();
