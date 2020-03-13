const API_URL = "https://api.spleeter.example.domain"

const instance = axios.create({
    auth: {
        username: localStorage.getItem("username"),
        password: localStorage.getItem("password")
    }
});

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function newFileName(filename){
    let pos = filename.lastIndexOf(".");
    filename = filename.substr(0, pos < 0 ? filename.length : pos) + ".zip";
    return filename;
}

async function handleFile(e) {
    // 隱藏已完成
    document.getElementById("done").style.display = "none";
    // 隱藏上傳區
    document.getElementById("uploader").style.display = "none";
    //轉轉轉
    document.getElementById("loader").classList.add("active");

    let file = document.querySelector('#upload');

    // 發請求囉
    const formData = new FormData();
    formData.append("stems", window.stem)
    formData.append("highFreq", document.getElementById('highFreq').checked ? 1 : 0)
    formData.append("file", file.files[0]);
    const seperate = await instance.post(`${API_URL}/seperate`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    const id = seperate.data.id;

    // 下載連結先弄好
    const a =  document.querySelector("#done a");
    a.setAttribute('download', `${id}.zip`)
    a.innerText = `${id}.zip`
    
    const i = document.createElement("i");
    i.classList.add("download", "icon")
    a.appendChild(i);

    document.getElementById("loader").innerText= "轉換中..."
    while(true) {
        const status = await instance.post(`${API_URL}/status`, {id}, 
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        if (status.data.status === 0) {
            document.querySelector("#done a").href = `${API_URL}${status.data.url}`
            document.getElementById("done").removeAttribute("style")
            document.getElementById("loader").classList.remove("active")
            document.getElementById("loader").innerText= "正在將檔案發給小恐龍！"
            document.getElementById("uploader").removeAttribute("style")
            break;
        } else {
            await sleep(5000)
        }
    }
}

document.addEventListener("DOMContentLoaded", e => {
    document.querySelector('#upload').addEventListener('change', handleFile, false)
    ts('.ts.dropdown:not(.basic)').dropdown();

    document.querySelectorAll('#stems-menu > .item').forEach(x => {
        x.addEventListener("click", e => {
            window.stem = x.dataset.stem;
            document.getElementById("stems-text").innerText = `${window.stem} Stems`
        })
    })
    document.querySelector("[data-stem='2']").click()
})
