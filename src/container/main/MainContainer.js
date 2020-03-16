/*global chrome*/
import React, { Component } from "react";
import { Link } from "react-router-dom";

import { connect } from "react-redux";
import * as listActions from "store/modules/lists";
import { bindActionCreators } from "redux";

import UrlLink from "component/UrlLink";

import "./MainContainer.scss";

class MainContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      err: ""
    };
    this.Clear = this.Clear.bind(this);
    this.Upload = this.Upload.bind(this);
  }

  Warning() {
    alert("백업 파일 업로드시 기존의 규칙은 모두 사라집니다!");
  }

  Clear() {
    chrome.storage.sync.clear(() => {
      this.Load();
    });
  }

  Load() {
    chrome.storage.sync.get(
      null,
      function(storageList) {
        const { ListActions } = this.props;
        ListActions.set(storageList);
      }.bind(this)
    );
  }

  Upload(e) {
    let fileReader = new FileReader();
    fileReader.onload = () => {
      if (this.Validation(fileReader.result)) {
        let result = JSON.parse(fileReader.result);
        chrome.storage.sync.clear(() => {
          for (let key in result) {
            const { nickname, url, code, jquery } = result[key];

            this.Save(key, nickname, url, code, jquery);
          }
        });
      } else {
        this.setState({
          err: "올바르지 않은 파일 입니다!"
        });
      }
    };
    fileReader.readAsText(e.target.files[0]);
  }

  Validation(obj) {
    try {
      let ans = true;
      let result = JSON.parse(obj);
      for (let key in result) {
        const { nickname, url, code, jquery } = result[key];
        if (!nickname || !url || !code || !jquery || !key) {
          ans = false;
        }
      }
      return ans;
    } catch (e) {
      return false;
    }
  }

  Save(id, nickname, url, code, jquery) {
    chrome.storage.sync.set(
      {
        [id]: {
          nickname: nickname,
          url: url,
          code: code,
          jquery: jquery
        }
      },
      () => {
        this.Load();
      }
    );
  }

  render() {
    return (
      <div className="main">
        <div className="big-btn">
          <Link to="new"> 새로운 규칙 추가 </Link>
        </div>

        <div className="bottom">
          {Object.entries(this.props.storageList).map(([id, value], i) => (
            <UrlLink id={id} {...value} key={i} />
          ))}
        </div>

        <div className="big big-btn">
          <div className="btn" onClick={this.Clear}>
            모든 규칙 삭제
          </div>
        </div>

        <div className="big big-btn">
          <a
            href={"data:text/json," + JSON.stringify(this.props.storageList)}
            className="btn"
            download="backup.json"
          >
            백업 다운
          </a>
        </div>

        <div className="big big-btn upload">
          <div className="btn">백업 업로드</div>
          <input
            type="file"
            className="file btn"
            onClick={this.Warning}
            onChange={this.Upload}
          />
        </div>
        <div className="alert">{this.state.err}</div>
      </div>
    );
  }
}

export default connect(
  value => ({
    storageList: value.lists.get("all")
  }),
  dispatch => ({
    ListActions: bindActionCreators(listActions, dispatch)
  })
)(MainContainer);
