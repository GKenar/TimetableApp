export function daysInMonth(month, year) {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const daysLeap = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0
    ? daysLeap[month]
    : days[month];
}

export function dateToYMD(date) {
  //return date.toISOString().split("T")[0];

  function pad(number) {
    if (number < 10) {
      return "0" + number;
    }
    return number;
  }

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate())
  );
}

export function dateToHMS(date) {
  //return date.toISOString().split("T")[0];

  function pad(number) {
    if (number < 10) {
      return "0" + number;
    }
    return number;
  }

  return (
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
}

export function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
