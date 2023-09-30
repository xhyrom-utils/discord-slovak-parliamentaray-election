export function formatHoursExt(hours) {
  if (hours === 1) 
    return "hodina";
  else if (hours > 1 && hours < 5) 
    return "hodiny";
  else 
    return "hodín";
}

export function formatMinutesExt(minutes) {
  if (minutes === 1) 
    return "minúta";
  else if (minutes > 1 && minutes < 5) 
    return "minúty";
  else 
    return "minút";
}

export function formatSecondsExt(seconds) {
  if (seconds === 1) 
    return "sekunda";
  else if (seconds > 1 && seconds < 5) 
    return "sekundy";
  else 
    return "sekúnd";
}
