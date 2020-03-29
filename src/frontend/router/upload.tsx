import { Component, h } from "preact";

import { Modlist, Game } from "@modwatch/types";
import { GlobalState, GlobalActions } from "../store/index";
import FileIcon from "../components/fileIcon";
import { selectFiles, readFile } from "../store/ipc";
import { getModlist } from "../store/pure";
import { setUserState } from "../store/local";

import { UploadFile } from "../../types";

type SelectOption = {
  display: string;
  value: string;
}

const games: Array<SelectOption> = [
  {
    display: "Skyrim",
    value: "skyrim"
  }, {
    display: "Skyrim Special Edition",
    value: "skyrimse"
  }, {
    display: "Skyrim VR",
    value: "skyrimvr"
  }, {
    display: "Fallout 4",
    value: "fallout4"
  }, {
    display: "Fallout 4 VR",
    value: "fallout4vr"
  }
];

const modManagers: Array<SelectOption> = [{
  display: "Vortex",
  value: "vortex"
}, {
  display: "Nexus Mod Manager",
  value: "nexusmodmanager"
}, {
  display: "Mod Organizer",
  value: "modorganizer"
}, {
  display: "Mod Organizer 2",
  value: "modorganizer2"
}, {
  display: "Other",
  value: "other"
}];

export default class Upload extends Component<GlobalState & GlobalActions, {
  form: Partial<Modlist>
}> {
  state = {
    form: {
      username: undefined,
      password: undefined,
      tag: undefined,
      enb: undefined,
      plugins: undefined,
      modlist: undefined,
      ini: undefined,
      prefsini: undefined,
      game: "" as Game,
      modmanager: ""
    }
  }
  setForm = ev => {
    const key = ev.target.id;
    const value = ev.target.value;
    this.setState(({ form }) => ({
      form: {
        ...form,
        [key]: value
      }
    }));
  }
  selectFiles = async ({ game, filename}) => {
    const filePaths = await selectFiles({ game, filename });
    const rawFiles = await readFile(filePaths);
    const mapped: UploadFile = rawFiles.map(rawFile => ({
      ...rawFile,
      content: rawFile.content.replace(/\r/g, "").split("\n")
    }));
    const files = {}
    for(let [key, value] of Object.entries(mapped)) {
      files[key] = value;
    }
    setUserState({
      ...this.props.user,
      files: {
        ...this.props.user.files,
        ...files
      }
    })
    console.log(mapped);
  }
  async componentDidMount() {
    if(this.props.user.username) {
      await getModlist({ username: this.props.user.username });
    }
  }
  render() {
    return (
      <section>
        <h1>Upload</h1>
        <form class="upload-form">
          {!this.props.user.authenticated ? <div>
            <div>
              <label class="sr-only" for="username">Username</label>
              <input required id="username" name="username" placeholder="Username" onChange={this.setForm} type="text"/>
            </div>
            <div>
              <label class="sr-only" for="password">Password</label>
              <input required id="password" name="password" placeholder="Password" onChange={this.setForm} type="password"/>
            </div>
          </div> : <div>{this.props.user.username}</div>}
          <div>
            <div>
              <label class="sr-only" for="tag">Tag</label>
              <input id="tag" name="tag" placeholder="Tag" onChange={this.setForm} type="text"/>
            </div>
            <div>
              <label class="sr-only" for="enb">ENB</label>
              <input id="enb" name="enb" placeholder="ENB" onChange={this.setForm} type="text"/>
            </div>
          </div>
          <div>
            <div class="full-width">
              <label class="sr-only" for="game">Game</label>
              <select required id="game" name="game" onChange={this.setForm}>
                <option value="" disabled selected={this.state.form.game as string === ""}>Game</option>
                {games.map(game => (
                  <option value={game.value}>{game.display}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div class="full-width">
              <label class="sr-only" for="modmanager">Mod Manager</label>
              <select required id="modmanager" name="modmanager" onChange={this.setForm}>
                <option value="" disabled selected={this.state.form.modmanager as string === ""}>Mod Manager (optional)</option>
                {modManagers.map(modManager => (
                  <option value={modManager.value}>{modManager.display}</option>
                ))}
              </select>
            </div>
          </div>
          <div class="files">
            <div class="file" onClick={e => this.selectFiles({ filename: "plugins", game: this.state.form.game })}>
              <FileIcon />
              plugins.txt
            </div>
            {this.state.form.modmanager !== "nexusmodmanager" && <div class="file" onClick={e => this.selectFiles({ filename: "plugins", game: this.state.form.game })}>
              <FileIcon />
              modlist.txt
            </div>}
            <div class="file" onClick={e => this.selectFiles({ filename: "plugins", game: this.state.form.game })}>
              <FileIcon />
              {this.state.form.game || "game"}.ini
            </div>
            <div class="file" onClick={e => this.selectFiles({ filename: "plugins", game: this.state.form.game })}>
              <FileIcon />
              {this.state.form.game || "game"}prefs.ini
            </div>
          </div>
        </form>
      </section>
    );
  }
}
