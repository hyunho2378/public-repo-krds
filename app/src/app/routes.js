// 화면 목록. 번호는 Figma 화면 세트 이름(R 저장소, G 전역, A 덧붙임)과 같다. 기준: UX/05_화면_전수목록.md
import Home from '../screens/P01_Home';
import Search from '../screens/P02_Search';
import Fields from '../screens/P03_Fields';
import Project from '../screens/P04_Project';
import Files from '../screens/P05_Files';
import Changes from '../screens/P06_Changes';
import Usage from '../screens/P07_Usage';
import Feedback from '../screens/P08_Feedback';
import Publish from '../screens/P09_Publish';
import PublishCheck from '../screens/P31_PublishCheck';
import RepoAnalytics from '../screens/P32_RepoAnalytics';
import MyProjects from '../screens/P10_MyProjects';
import Organizations from '../screens/P11_Organizations';
import Login from '../screens/P12_Login';
import ErrorScreen from '../screens/P13_Error';
import Help from '../screens/P14_Help';
import Requests from '../screens/P15_Requests';
import { createElement } from 'react';
import Code from '../screens/P16_Code';
import RepoSections, { SECTION_KEYS } from '../screens/P22_RepoSections';
import Write from '../screens/P23_Write';
import NewIssue from '../screens/P24_NewIssue';
import Compare from '../screens/P25_Compare';
import NewProject from '../screens/P28_NewProject';
import Explore from '../screens/P29_Explore';
import { Topics as ExploreTopics, Snippets as ExploreSnippets } from '../screens/P29_Explore';
import Jobs from '../screens/P30_Jobs';
import { LoginFailed, LoginOtp, LoginSignup, LoginReset } from '../screens/P12b_LoginStates';
import { Insights, Checklist, LawAlerts, Handover, Mcp } from '../screens/P26_Insights';
import { Notifications, Settings, ProjectSettings, RepoGraph, Collaborate } from '../screens/P27_Account';
import Commit from '../screens/P17_Commit';
import { Branches, Tags, Releases } from '../screens/P18_Refs';
import { Issues, Issue } from '../screens/P19_Issues';
import { MergeRequests, MergeRequest } from '../screens/P20_MergeRequests';
import Contributors from '../screens/P21_Contributors';

const SECTION_ID = { boards: 'R-13', labels: 'R-14', milestones: 'R-15', pipelines: 'R-18', packages: 'R-20', wiki: 'R-21', snippets: 'R-22', members: 'R-23', activity: 'R-24' };

export const routes = [
  { id: 'A-01', path: '/', Screen: Home },
  { id: 'G-02', path: '/search', Screen: Search },
  { id: 'G-03', path: '/fields', Screen: Fields },
  { id: 'R-01', path: '/projects/:id', Screen: Code },
  { id: 'A-02', path: '/projects/:id/about', Screen: Project },
  { id: 'R-02', path: '/projects/:id/files', Screen: Files },
  { id: 'R-04', path: '/projects/:id/changes', Screen: Changes },
  { id: 'R-30', path: '/projects/:id/use', Screen: Usage },
  { id: 'A-04', path: '/projects/:id/feedback', Screen: Feedback },
  { id: 'A-03', path: '/projects/:id/publish-check', Screen: PublishCheck },
  { id: 'G-05c', path: '/publish', Screen: Publish },
  { id: 'G-06', path: '/my', Screen: MyProjects },
  { id: 'G-04', path: '/organizations', Screen: Organizations },
  { id: 'G-08', path: '/login', Screen: Login },
  { id: 'G-09', path: '/error', Screen: ErrorScreen },
  { id: 'G-10', path: '/help', Screen: Help },
  { id: 'A-05', path: '/requests', Screen: Requests },
  { id: 'R-02', path: '/projects/:id/code', Screen: Code },
  { id: 'R-03', path: '/projects/:id/code/*', Screen: Code },
  { id: 'R-05', path: '/projects/:id/changes/:sha', Screen: Commit },
  { id: 'R-07', path: '/projects/:id/branches', Screen: Branches },
  { id: 'R-08', path: '/projects/:id/tags', Screen: Tags },
  { id: 'R-09', path: '/projects/:id/releases', Screen: Releases },
  { id: 'R-11', path: '/projects/:id/issues', Screen: Issues },
  { id: 'R-12', path: '/projects/:id/issues/:iid', Screen: Issue },
  { id: 'R-16', path: '/projects/:id/merge-requests', Screen: MergeRequests },
  { id: 'R-17', path: '/projects/:id/merge-requests/:iid', Screen: MergeRequest },
  { id: 'R-17', path: '/projects/:id/merge-requests/:iid/commits', Screen: MergeRequest },
  { id: 'R-17', path: '/projects/:id/merge-requests/:iid/pipelines', Screen: MergeRequest },
  { id: 'R-17', path: '/projects/:id/merge-requests/:iid/diffs', Screen: MergeRequest },
  { id: 'R-10', path: '/projects/:id/contributors', Screen: Contributors },
  ...SECTION_KEYS.map((key) => ({
    id: SECTION_ID[key],
    path: `/projects/:id/${key}`,
    Screen: () => createElement(RepoSections, { section: key }),
  })),
  { id: 'R-27', path: '/projects/:id/new', Screen: () => createElement(Write, { mode: 'new' }) },
  { id: 'R-27', path: '/projects/:id/edit/*', Screen: () => createElement(Write, { mode: 'edit' }) },
  { id: 'R-28', path: '/projects/:id/upload', Screen: () => createElement(Write, { mode: 'upload' }) },
  { id: 'R-29', path: '/projects/:id/branches/new', Screen: () => createElement(Write, { mode: 'branch' }) },
  { id: 'R-11', path: '/projects/:id/issues/new', Screen: () => createElement(NewIssue, { kind: 'issue' }) },
  { id: 'R-16', path: '/projects/:id/merge-requests/new', Screen: () => createElement(NewIssue, { kind: 'merge' }) },
  { id: 'R-06', path: '/projects/:id/compare', Screen: Compare },
  { id: 'A-06', path: '/insights', Screen: Insights },
  { id: 'A-11', path: '/checklist', Screen: Checklist },
  { id: 'A-07', path: '/mcp', Screen: Mcp },
  { id: 'A-10', path: '/projects/:id/law-alerts', Screen: LawAlerts },
  { id: 'A-08', path: '/projects/:id/handover', Screen: Handover },
  { id: 'G-07', path: '/notifications', Screen: Notifications },
  { id: 'G-11', path: '/settings', Screen: Settings },
  { id: 'A-09', path: '/collaborate', Screen: Collaborate },
  { id: 'R-26', path: '/projects/:id/settings', Screen: ProjectSettings },
  { id: 'R-25', path: '/projects/:id/analytics', Screen: RepoAnalytics },
  { id: 'R-25g', path: '/projects/:id/graph', Screen: RepoGraph },
  { id: 'G-05', path: '/projects/new', Screen: NewProject },
  { id: 'G-01', path: '/explore', Screen: Explore },
  { id: 'G-01t', path: '/explore/topics', Screen: ExploreTopics },
  { id: 'G-01s', path: '/explore/snippets', Screen: ExploreSnippets },
  { id: 'R-19', path: '/projects/:id/jobs', Screen: Jobs },
  { id: 'G-08b', path: '/login/failed', Screen: LoginFailed },
  { id: 'G-08c', path: '/login/otp', Screen: LoginOtp },
  { id: 'G-08d', path: '/register', Screen: LoginSignup },
  { id: 'G-08e', path: '/password', Screen: LoginReset },
];
