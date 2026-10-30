// P-05 파일. D-21: 공공 깃랩에는 별도 '파일' 화면이 없고 리포지토리(코드) 화면 하나다. 옛 주소는 리포지토리로 보낸다.
import { Navigate, useParams } from 'react-router-dom';

export default function Files() {
  const { id } = useParams();
  return <Navigate to={`/projects/${id}/code`} replace />;
}
