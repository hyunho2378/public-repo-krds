// External inference is opt-in. No README is sent outside the service by default.
export const externalAdapters={
 embedding:{enabled:process.env.ENABLE_EMBEDDINGS==='true',status:'not-connected',notice:'BM25 기본, 모델/개인정보 전송 승인 후 확장'},
 generativeAI:{enabled:process.env.ENABLE_AI==='true'&&!!process.env.AI_API_KEY,status:'not-connected',notice:'규칙 추출 기본, API 키만으로 외부 전송 안 함'},
 law:{enabled:!!process.env.LAW_API_KEY,status:'not-connected'}
};
