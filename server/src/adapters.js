// External inference is opt-in. No README is sent outside the service by default.
export const externalAdapters={
 embedding:{enabled:process.env.ENABLE_EMBEDDINGS==='true',status:'not-connected',notice:'BM25가 기본입니다. 모델·개인정보 전송 승인 후 구현할 확장 자리입니다.'},
 generativeAI:{enabled:process.env.ENABLE_AI==='true'&&!!process.env.AI_API_KEY,status:'not-connected',notice:'규칙 추출이 기본입니다. API 키만으로 외부 전송을 시작하지 않습니다.'},
 law:{enabled:!!process.env.LAW_API_KEY,status:'not-connected'}
};
