// Development placeholders only. Not production activity.
export const endpoints=[
  [
    "F-01",
    "POST",
    "/search",
    "업무 문장 검색",
    {
      "query": "string",
      "filters": {}
    },
    {
      "items": [],
      "total": 0
    }
  ],
  [
    "F-02",
    "POST",
    "/classify",
    "분야 자동 분류",
    {
      "projectId": 1,
      "readme": "string"
    },
    {
      "fields": [],
      "needsReview": true
    }
  ],
  [
    "F-03",
    "GET",
    "/catalog",
    "분야/조건 필터",
    null,
    {
      "items": [],
      "total": 0
    }
  ],
  [
    "F-04",
    "POST",
    "/duplicates",
    "중복 프로젝트 안내",
    {
      "name": "string",
      "description": "string"
    },
    {
      "items": []
    }
  ],
  [
    "F-05",
    "GET",
    "/projects/{id}/connections",
    "만든 사람 연결",
    null,
    {
      "items": []
    }
  ],
  [
    "F-06",
    "POST",
    "/mcp",
    "MCP 검색 어댑터",
    {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "tools/list"
    },
    {
      "tools": []
    }
  ],
  [
    "F-11",
    "GET",
    "/projects/{id}/card",
    "소개 카드",
    null,
    {
      "projectId": 1,
      "title": null,
      "summary": null,
      "tasks": [],
      "execution": null,
      "license": null,
      "limitations": [],
      "organization": null,
      "updatedAt": null,
      "provenance": []
    }
  ],
  [
    "F-12",
    "GET",
    "/projects/{id}/reference-dates",
    "기준 날짜",
    null,
    {
      "references": [],
      "needsReview": true
    }
  ],
  [
    "F-13",
    "GET",
    "/projects/{id}/law-alerts",
    "법령 변경 알림",
    null,
    {
      "items": [],
      "checkedAt": null
    }
  ],
  [
    "F-14",
    "POST",
    "/projects/{id}/environment-check",
    "실행 환경 판정",
    {
      "network": "internet",
      "os": "windows",
      "canInstall": false
    },
    {
      "result": "unknown",
      "reasons": [],
      "steps": []
    }
  ],
  [
    "F-21",
    "POST",
    "/publication-checks",
    "공개 준비 점검",
    {
      "projectId": 1,
      "ref": "HEAD"
    },
    {
      "status": "not_checked",
      "checks": [],
      "canPublish": false
    }
  ],
  [
    "F-22",
    "GET",
    "/projects/{id}/security-alerts",
    "제작자 전용 보안 알림",
    null,
    {
      "items": [],
      "visibility": "owner-only"
    }
  ],
  [
    "F-23",
    "POST",
    "/projects/{id}/readme-proposals",
    "README 개선 제안",
    {
      "content": "string"
    },
    {
      "proposalId": null,
      "status": "not_sent"
    }
  ],
  [
    "F-24",
    "GET",
    "/templates/readme",
    "표준 README 양식",
    null,
    {
      "markdown": "# 도구 이름\n\n## 하는 일\n\n## 사용 방법\n\n## 실행 환경\n\n## 기준 날짜\n\n## 이용 조건\n\n## 문의\n"
    }
  ],
  [
    "F-31",
    "POST",
    "/projects/{id}/feedback",
    "의견 양식",
    {
      "type": "bug",
      "title": "string",
      "body": "string"
    },
    {
      "issueId": null,
      "status": "not_sent"
    }
  ],
  [
    "F-32",
    "GET",
    "/projects/{id}/reuses",
    "재사용 기록 조회",
    null,
    {
      "items": [],
      "total": 0
    }
  ],
  [
    "F-32",
    "POST",
    "/projects/{id}/reuses",
    "사용 기록",
    {
      "organizationId": "string",
      "usedAt": "2026-10-30"
    },
    {
      "id": null,
      "status": "not_saved"
    }
  ],
  [
    "F-33",
    "GET",
    "/organizations",
    "기관 현황",
    null,
    {
      "items": []
    }
  ],
  [
    "F-34",
    "GET",
    "/projects/{id}/related-resources",
    "공공데이터/기존 도구",
    null,
    {
      "items": []
    }
  ],
  [
    "F-35",
    "GET",
    "/requests",
    "업무 요청 보드 조회",
    null,
    {
      "items": [],
      "total": 0
    }
  ],
  [
    "F-35",
    "POST",
    "/requests",
    "업무 요청 등록",
    {
      "task": "string",
      "currentProcess": "string",
      "expectedOutcome": "string"
    },
    {
      "id": null,
      "status": "not_saved"
    }
  ],
  [
    "F-35",
    "POST",
    "/requests/{id}/votes",
    "요청 공감",
    {},
    {
      "status": "not_saved"
    }
  ],
  [
    "F-36",
    "GET",
    "/projects/{id}/version-guide",
    "버전/오류 안내",
    null,
    {
      "items": [],
      "from": null,
      "to": null
    }
  ],
  [
    "F-37",
    "POST",
    "/projects/{id}/handover",
    "인수인계 문서 생성",
    {
      "ref": "HEAD"
    },
    {
      "markdown": null,
      "status": "not_generated"
    }
  ],
  [
    "F-38",
    "GET",
    "/development-guide",
    "단계별 개발 안내",
    null,
    {
      "steps": []
    }
  ],
  [
    "F-39",
    "GET",
    "/coverage-map",
    "중복/미개발 분야 지도",
    null,
    {
      "fields": [],
      "sourceDate": null
    }
  ]
];
