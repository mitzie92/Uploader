import { h } from "preact";

export default function(props: any) {
  console.log(props);
  return (
    <section>
      <h1>404 Not Found</h1>
      <p>Good try, but this page doesn't exist</p>
    </section>
  );
}
