import fs from "fs";

// 文件列表
const fileList: string[] = [];
const errorFileList: string[] = [];

// 要检查的入口文件夹
let rootDir = "./dist";
// 会被统计的文件后缀名
const suffixWhiteList = [".ts", ".js", ".css", ".html"];
// 中文正则匹配
const characterReg = /[\u4E00-\u9FA5]+/g;

// 收集文件地址
const getFileList = async (path: string) => {
  const files = await fs.readdirSync(path);

  for (let i = 0; i < files.length; i++) {
    const fileDir = files[i];

    const fileInfo = fs.statSync(`${path}/${fileDir}`);
    if (fileInfo.isDirectory()) {
      await getFileList(`${path}/${fileDir}`);
    } else {
      if (suffixWhiteList.find(suffix => fileDir.endsWith(suffix))) {
        fileList.push(`${path}/${fileDir}`);
      }
    }
  }
};

// 读取文件内容
const analysisFile = async (path: string) => {
  const result = await fs.readFileSync(path);

  const fileStr = result.toString();

  if (characterReg.test(fileStr)) {
    console.error(`Error: ==========================`);
    console.error(`Error: ${path}文件中存在中文：`);
    errorFileList.push(fileStr);
    fileStr.match(characterReg)?.map(str => {
      const index = fileStr.search(str);
      const fragment = fileStr.slice(index, index + str.length);
      console.error(`Error: ${fragment}(index: ${index})`);
    });
  }
};

const fn = async () => {
  try {
    
    console.log('开始解析文件夹...');
    await getFileList(rootDir);
    console.log('文件读取完毕, 正在解析...')

    for (let i = 0; i < fileList.length; i++) {
      await analysisFile(fileList[i]);
    }
  } catch (err) {
    throw new Error("文件解析出现错误!");
  }

  console.error(`Error: ==========================`);
  console.log(`总计扫描文件${fileList.length}个, 存在中文的文件${errorFileList.length}个`);
};

const outerDir = process.argv.find(str => str.includes('dir='));

if (outerDir) {
    rootDir = outerDir?.split('=')[1]
}

fn();
