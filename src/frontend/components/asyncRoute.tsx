import { h, Component } from "preact";

function noop() {}

export default class AsyncRoute extends Component<
  {
    getComponent(url: string, cb: () => any, props: any);
    url: string;
    matches: any;
  },
  {
    componentData?: any;
  }
> {
  constructor() {
    super();
    this.state = {
      componentData: null
    };
  }
  _mounted: boolean = true;
  loadComponent = async () => {
    if(!this._mounted) {
      return;
    }
    const componentData = await this.props.getComponent(
      this.props.url,
      noop,
      Object.assign({}, this.props, this.props.matches)
    );

    this._mounted && this.setState({
      componentData
    });
  };
  componentWillReceiveProps(nextProps) {
    if (this._mounted && this.props.path && this.props.path !== nextProps.path) {
      this.setState(
        {
          componentData: null
        },
        () => {
          this.loadComponent();
        }
      );
    }
  }
  componentWillMount() {
    this.loadComponent();
  }
  componentWillUnmount() {
    this._mounted = false;
  }
  render() {
    if (this.state.componentData) {
      return this.state.componentData.props
        ? this.state.componentData
        : h(this.state.componentData, this.props);
    }
    return null;
  }
}
