import React from 'react';
import Octokit from '@octokit/rest';
import styled, { injectGlobal } from 'styled-components';
import Assistant from '../../styles/fonts/Assistant-ExtraLight.ttf';

injectGlobal`
  * {
    box-sizing: border-box;
  }

  @font-face {
    font-family: 'Assistant';
    src: url(${Assistant});
  }

  body {
    max-height: 100vh !important;
    overflow: hidden;
  }

`;

const Header = styled.h1`
  height: 5vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Assistant', sans-serif;
  font-size: 55px;
  font-weight: 300;
`;

const LeaderboardContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 80vh; 
  width: 100vw;
  margin-bottom: 100px;
  @media (max-width: 725px) {
    flex-direction: column;
  }
`;

const LeaderboardContainerLeft = styled.div`
  width: 40vw;
  height: 80vh;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-direction: column;
  position: relative;
`;

const LeftSpan = styled.span`
  position: absolute;
  left: 0;
  top: 45%;
  border: px solid red;
  transform: rotate(-90deg);
  font-family: 'Assistant', sans-serif;
  font-size: 25px;
  font-weight: 600;
  color: #607d8b;
`;

const RightBorder = styled.div`
  position: absolute;
  right: 0;
  height: 30vh;
  top: 30%;
  width: 1px;
  background-color: #e0e0e0;
`;

const TopCards = styled.div`
  height: 150px;
  width: 300px;
  box-shadow: 0 4px 22px 0 rgba(0,0,0,0.16);
  border-radius: 4px;
`;

const LeaderboardContainerRight = styled.div`
  width: 60vw;
  max-height: 80vh;
  overflow-y: scroll;
`;

const Leaderboard = styled.ol`
  padding: 0;
`;

const ListItem = styled.li`
  height: 90px;
  width: 350px;
  margin: 10px auto;
  font-size: 1.8rem;
  display: flex;
  // box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  transition: all 0.2s ease-in-out;
  // border-radius: 3px;
  border: 1px solid #f5f5f5;
  background-color: #fafafa;
  &:hover {
    // box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
  }
`;

const Avatar = styled.img`
  height: 60px;
  width: 60px;
  border-radius: 50%;
  margin: 5px;
  margin-top: 15px;
  margin-left: 10px;
  border: 2px solid #eeeeee;
`;

const Username = styled.span`
  flex-grow: 1;
  padding: 8px;
  height: 90px;
  display: flex;
  justify-content: flex-start;
  padding-left: 40px;
  align-items: center;
  font-family: 'Assistant', sans-serif;
  font-size: 20px;
  font-weight: 400;
`;

const Commits = styled.span`
  padding: 8px;
  width: 52px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: #607d8b;
  font-family: 'Assistant', sans-serif;
  font-size: 25px;
  font-weight: 600;
`;

function addCommit(prevState, user) {
  if (!user) {
    return prevState;
  } else {
    const username = user.login;
    const prevLeaderboard = prevState.leaderboard;
    let index;
    const result = prevLeaderboard.find((user, i) => {
      if (user.username === username) {
        index = i;
        return true;
      }
    });
    if (!result) {
      return {
        leaderboard: [
          ...prevLeaderboard,
          { username, commits: 1, avatar: user.avatar_url, url: user.html_url }
        ]
      };
    } else {
      let newLeaderboard = prevLeaderboard;
      newLeaderboard[index].commits += 1;
      return { leaderboard: newLeaderboard };
    }
  }
}

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = { leaderboard: [] };
    this.octokit = new Octokit();
  }

  getLeaderboard() {
    this.octokit.repos.getForOrg({ org: 'osdc' }).then(repos => {
      repos.data.forEach(({ name }) => {
        this.octokit.repos.getCommits({ owner: 'osdc', repo: name }).then(commits => {
          commits.data.forEach(commit => {
            const { committer, author } = commit;
            this.setState(prevState => addCommit(prevState, committer));
            this.setState(prevState => addCommit(prevState, author));
          });
        });
      });
    });
  }

  componentDidMount() {
    this.getLeaderboard();
  }

  render() {
    const sorted = this.state.leaderboard.sort((a, b) => {
      return b.commits - a.commits;
    });

    let listLength = sorted.length;

    let standardCommits = sorted.slice(0);

    const topCommits = sorted.slice(0,3);

    standardCommits = standardCommits.splice(3,listLength);

    const topCommitList = topCommits.map((user, i) => (
      <TopCards value={i} >{user.username}</TopCards>
    ));

    const commitList = standardCommits.map((user, i) => (
      <ListItem key={i}>
        <Avatar src={user.avatar} />
        <Username>@{user.username}</Username>
        <Commits>{user.commits}</Commits>
      </ListItem>
    ));

    return (
      <div>
        <Header>Leaderboard</Header>

        <LeaderboardContainer>
          <LeaderboardContainerLeft>
            <LeftSpan>Top Players</LeftSpan>
            {topCommitList}
            <RightBorder></RightBorder>
          </LeaderboardContainerLeft>

          <LeaderboardContainerRight>
            <Leaderboard>{commitList}</Leaderboard>
          </LeaderboardContainerRight>
        </LeaderboardContainer>

      </div>
    );
  }
}
