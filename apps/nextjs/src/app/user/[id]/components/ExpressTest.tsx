async function getData() {
  const res = await fetch("http://localhost:3000/test");
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }
  console.log(res.json);
  return res.json();
}

export default async function ExpressTest() {
  const data = await getData();
  return <>{JSON.stringify(data)}</>;
}
