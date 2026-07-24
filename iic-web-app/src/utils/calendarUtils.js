export function mapEvents(data) {
  return data.map((e) => ({
    title: e.title,
    date: e.date,
  }));
}
