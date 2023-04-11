const getCsv = (data) => {
  return [
    Object.keys(data[0]).join(","),
    ...data.map((item) => Object.values(item).join(",")),
  ].join("\n");
};

export { getCsv };
