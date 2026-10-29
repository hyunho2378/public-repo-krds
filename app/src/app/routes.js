// 화면 목록(PRD 5장, UX-002). P-번호 = Figma Screens 페이지 이름.
import Home from '../screens/P01_Home';
import Search from '../screens/P02_Search';
import Fields from '../screens/P03_Fields';
import Project from '../screens/P04_Project';
import Files from '../screens/P05_Files';
import Changes from '../screens/P06_Changes';
import Usage from '../screens/P07_Usage';
import Feedback from '../screens/P08_Feedback';
import Publish from '../screens/P09_Publish';
import MyProjects from '../screens/P10_MyProjects';
import Organizations from '../screens/P11_Organizations';
import Login from '../screens/P12_Login';
import ErrorScreen from '../screens/P13_Error';
import Help from '../screens/P14_Help';
import Requests from '../screens/P15_Requests';
import Code from '../screens/P16_Code';
import Commit from '../screens/P17_Commit';
import { Branches, Releases } from '../screens/P18_Refs';
import { Issues, Issue } from '../screens/P19_Issues';
import { MergeRequests, MergeRequest } from '../screens/P20_MergeRequests';
import Contributors from '../screens/P21_Contributors';

export const routes = [
  { id: 'P-01', path: '/', Screen: Home },
  { id: 'P-02', path: '/search', Screen: Search },
  { id: 'P-03', path: '/fields', Screen: Fields },
  { id: 'P-16', path: '/projects/:id', Screen: Code },
  { id: 'P-04', path: '/projects/:id/about', Screen: Project },
  { id: 'P-05', path: '/projects/:id/files', Screen: Files },
  { id: 'P-06', path: '/projects/:id/changes', Screen: Changes },
  { id: 'P-07', path: '/projects/:id/use', Screen: Usage },
  { id: 'P-08', path: '/projects/:id/feedback', Screen: Feedback },
  { id: 'P-09', path: '/publish', Screen: Publish },
  { id: 'P-10', path: '/my', Screen: MyProjects },
  { id: 'P-11', path: '/organizations', Screen: Organizations },
  { id: 'P-12', path: '/login', Screen: Login },
  { id: 'P-13', path: '/error', Screen: ErrorScreen },
  { id: 'P-14', path: '/help', Screen: Help },
  { id: 'P-15', path: '/requests', Screen: Requests },
  { id: 'P-16', path: '/projects/:id/code', Screen: Code },
  { id: 'P-16', path: '/projects/:id/code/*', Screen: Code },
  { id: 'P-17', path: '/projects/:id/changes/:sha', Screen: Commit },
  { id: 'P-18', path: '/projects/:id/branches', Screen: Branches },
  { id: 'P-18', path: '/projects/:id/releases', Screen: Releases },
  { id: 'P-19', path: '/projects/:id/issues', Screen: Issues },
  { id: 'P-19', path: '/projects/:id/issues/:iid', Screen: Issue },
  { id: 'P-20', path: '/projects/:id/merge-requests', Screen: MergeRequests },
  { id: 'P-20', path: '/projects/:id/merge-requests/:iid', Screen: MergeRequest },
  { id: 'P-21', path: '/projects/:id/contributors', Screen: Contributors },
];
