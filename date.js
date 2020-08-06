import moment from "moment";
import isNil from "lodash/isNil";

export const formatDate = (date, formatter, placeholder = "-") => {
  let out = placeholder;

  //skip running moment if date is obviously not valid
  if (isNil(date)) {
    return placeholder;
  }

  if (date && formatter) {
    out = moment.utc(date).format(formatter);
  } else {
    out = moment.utc(date).format();
  }

  //if moment cannot format the date
  if (out === "Invalid date") {
    return placeholder;
  }

  return out;
};

export const formatDateLShortYear = (date) => {
  if (!date) {
    return "-";
  }
  const aMoment = moment.utc(date);
  const formatted = aMoment.format("L");
  return formatted.replace(aMoment.year(), aMoment.format("YY"));
};

export const formatDateLL = (date) => formatDate(date, "LL");
export const formatDateL = (date) => formatDate(date, "L");
export const formatDateLT = (date) => formatDate(date, "LT");
export const formatDateLTS = (date) => formatDate(date, "LTS");
export const formatDateYMD = (date) => formatDate(date, "YYYY/MM/DD");
export const formatDateDMY = (date) => formatDate(date, "DD/MM/YYYY");
export const formatDateConnectYMD = (date) =>
  formatDate(date, "YYYY-MM-DD", null);

export const formatDateWithoutUTC = (date) => {
  return date ? moment(date).format("MM-DD-YYYY") : null;
};
export const formatDateMY = (date) => formatDate(date, "MM/YYYY");
export const formatDateConnectIso = (date) =>
  formatDate(date, "YYYY-MM-DD[T]HH:mm:ss", null);
