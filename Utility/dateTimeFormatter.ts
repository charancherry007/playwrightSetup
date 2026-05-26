async getCurrentESTTime() {

const currentDate = new Date();
const estTime = currentDate.toLocaleTimeString("en-US", {
  timeZone: "America/New_York",
  hour12: false,
});

// Split HH:MM:SS
const [h, m, s] = estTime.split(":");
console.log("Hour:", h);
console.log("Minutes:", m);
console.log("Seconds:", s);
}

async getESTDate() {
  const currentDate = new Date();

  // Get EST date in YYYY-MM-DD format change CA to US if you want MM/DD/YYYY format
  const estDate = currentDate.toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });

  const [y, m, d] = estDate.split("-");

  console.log("Year:", y);
  console.log("Month:", m);
  console.log("Day:", d);

  return { y, m, d };
}
