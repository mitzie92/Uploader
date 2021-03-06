import { h, Fragment } from "preact";
import { route } from "preact-router";
import { GlobalState, GlobalActions } from "../store/index";

export default function(props: GlobalState & GlobalActions) {
  return (
    <Fragment>
      <section class="link" onClick={e => (props.logout(), route("/upload"))}>
        <h1>New User</h1>
        <p>If you have not used the Modwat.ch uploader before, click here</p>
      </section>
      <section class="link" onClick={async e => {
        try {
          await props.login();
          route("/upload");
        } catch(e) {
          props.addNotification("Login Failed", {
            type: "error"
          });
        }
      }}>
        <h1>Existing User</h1>
        <p>If you have used any version of the Modwat.ch uploader before, log in to your existing account by clicking here</p>
    </section>
    </Fragment>
  );
}
