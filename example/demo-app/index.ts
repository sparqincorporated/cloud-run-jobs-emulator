(async () => {
  console.log("Environment Variables:");
  console.log(`MY_VAR: ${JSON.stringify(process.env)}`);
  await new Promise((resolve) => setTimeout(resolve, 2000));
})();
