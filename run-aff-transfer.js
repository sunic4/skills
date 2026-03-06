const url = 'https://agentrouter.org/api/user/aff_transfer';

const options = {
  method: 'POST',
  headers: {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'zh-CN,zh;q=0.9',
    'cache-control': 'no-store',
    'content-type': 'application/json',
    'new-api-user': '72165',
    'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'cookie': 'acw_tc=0a0ccb0417727207780567373e4a821a51169820e05b2b320ae752def2f6df; _ga=GA1.1.508502931.1772720778; session=MTc3MjcyMDk0OHxEWDhFQVFMX2dBQUJFQUVRQUFEXzR2LUFBQWNHYzNSeWFXNW5EQVVBQTJGbVpnWnpkSEpwYm1jTUJnQUVWRFp0VHdaemRISnBibWNNRFFBTGIyRjFkR2hmYzNSaGRHVUdjM1J5YVc1bkRBNEFESFJTU21Rd1ZXMUVTRXBuVEFaemRISnBibWNNQkFBQ2FXUURhVzUwQkFVQV9RSXp5Z1p6ZEhKcGJtY01DZ0FJZFhObGNtNWhiV1VHYzNSeWFXNW5EQTRBREdkcGRHaDFZbDgzTWpFMk5RWnpkSEpwYm1jTUJnQUVjbTlzWlFOcGJuUUVBZ0FDQm5OMGNtbHVad3dJQUFaemRHRjBkWE1EYVc1MEJBSUFBZ1p6ZEhKcGJtY01Cd0FGWjNKdmRYQUdjM1J5YVc1bkRBa0FCMlJsWm1GMWJIUT18CRIw1iQVQWl3Q97fH2aaTEZYRNmQ98RsSd-IEmwbNtk=; _ga_PY29DXE5ZT=GS2.1.s1772720777$o1$g1$t1772722172$j40$l0$h0',
    'Referer': 'https://agentrouter.org/console/topup'
  },
  body: JSON.stringify({ quota: 500099 })
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const totalRuns = 95;
  const waitTime = 10000;

  for (let i = 1; i <= totalRuns; i++) {
    console.log(`\n=== 第 ${i}/${totalRuns} 次请求 ===`);
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
    }

    if (i < totalRuns) {
      console.log(`等待 ${waitTime / 1000} 秒...`);
      await sleep(waitTime);
    }
  }

  console.log('\n=== 全部完成 ===');
}

main();
