import { h, Component } from "preact";
import Router, { route } from "preact-router";
import { createHashHistory } from "history";
import AsyncRoute from "../components/asyncRoute";

import NotFound from "./notFound";
import Landing from "./landing";
import Upload from "./upload";
// import Post from "../components/post";

import { GlobalState, GlobalActions } from "../store/index";
// import { RouteProps, StoreProps } from "../types";

const ROUTE_TRANSITION_TIMEOUT = 150; // needs to match transition duration in src/global.css

export default class Routes extends Component<
  GlobalState & GlobalActions,
  { fading: boolean; timeout: boolean }
> {
  state = {
    fading: false,
    timeout: false
  };
  cancelRouteChange = false;
  wrappedImport = async importedComponent => {
    await importedComponent;
    this.setState(() => ({
      fading: false
    }));
    return importedComponent;
  };
  // importPost = async (url, cb, props) => {
  //   const DynamicPost = await this.wrappedImport(import(`./${props.title}.js`));
  //   return <Post {...DynamicPost.metadata} content={DynamicPost.default} />;
  // };
  routeChange = e => {
    if (this.cancelRouteChange) {
      this.cancelRouteChange = false;
      return;
    }
    if (this.state.fading || this.state.timeout) {
      return;
    }
    // if (
    //   e.previous &&
    //   e.previous.indexOf("/u/") === 0 &&
    //   e.current.key === "modlist" &&
    //   e.current.props.matches.username ===
    //     e.previous.slice(3, e.current.props.matches.username.length + 3)
    // ) {
    //   return;
    // }
    e.previous && route(e.previous, true);
    setTimeout(() => {
      this.setState(
        () => ({
          timeout: false
        }),
        () => {
          if (e.previous) {
            this.cancelRouteChange = true;
            route(e.url, true);
          }
        }
      );
    }, ROUTE_TRANSITION_TIMEOUT);
    this.setState(() => ({
      fading: true,
      timeout: true
    }));
  };
  render() {
    return (
      <div
        class={`router-wrapper ${
          this.state.fading || this.state.timeout ? "fading" : ""
        }`}
      >
        <Router onChange={this.routeChange} history={createHashHistory()}>
          <AsyncRoute
            key={"landing"}
            path="/"
            {...this.props}
            getComponent={() =>
              this.wrappedImport(
                // import("./landing").then(c => c.default)
                Promise.resolve(Landing)
              )
            }
          />
          <AsyncRoute
            key="upload"
            path="/upload/:username?"
            {...this.props}
            getComponent={() =>
              this.wrappedImport(
                // import("./upload").then(c => {
                //   return c.default;
                // })
                Promise.resolve(Upload)
              )
            }
          />
          <AsyncRoute
            key="404"
            default
            {...this.props}
            getComponent={() =>
              this.wrappedImport(
                Promise.resolve(NotFound)
              )
            }
          />
        </Router>
      </div>
    );
  }
}
