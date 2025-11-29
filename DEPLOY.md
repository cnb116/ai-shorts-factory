# 배포 가이드 (Vercel)

이 문서는 `shopping-shorts-app`을 Vercel을 통해 무료로 배포하는 방법을 설명합니다.

## 방법 1: 터미널에서 바로 배포하기 (가장 빠름)

1.  터미널을 엽니다.
2.  프로젝트 폴더에서 아래 명령어를 실행합니다:
    ```bash
    npx vercel
    ```
3.  Vercel이 처음이라면 로그인(Login)을 요청할 수 있습니다. 브라우저 창이 뜨면 로그인해주세요.
4.  이후 터미널에서 몇 가지 질문이 나옵니다. 대부분 엔터(Enter)를 눌러 기본값을 선택하면 됩니다.

    *   `Set up and deploy “~\shopping-shorts-app”?` -> **y** (Yes)
    *   `Which scope do you want to deploy to?` -> (본인 계정 선택 후 엔터)
    *   `Link to existing project?` -> **n** (No)
    *   `What’s your project’s name?` -> (엔터, 기본값 사용)
    *   `In which directory is your code located?` -> (엔터, 기본값 `./` 사용)
    *   `Want to modify these settings?` -> **n** (No)

5.  배포가 완료되면 `Production: https://...` 형태의 주소가 나옵니다. 이 주소가 전 세계 어디서나 접속 가능한 내 앱의 주소입니다!

## 방법 2: GitHub 연동 (지속적 배포)

1.  이 프로젝트를 GitHub 저장소(Repository)에 올립니다.
2.  [Vercel 웹사이트](https://vercel.com)에 접속하여 로그인합니다.
3.  'Add New...' -> 'Project'를 클릭합니다.
4.  GitHub 계정을 연결하고, 방금 올린 저장소를 'Import' 합니다.
5.  'Deploy' 버튼을 누르면 끝! 이후 GitHub에 코드를 수정해서 올릴 때마다 자동으로 배포됩니다.
