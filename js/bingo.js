const API_BASE_URL = "https://211.21.155.101/api/SP/202205/ForTest";
var selectedNumber;
var memberId;
var bingo;
var board = 3; //3*3的遊戲
var lastUploadImage;

// 壓縮圖片設定參數
var compressRatio = 0.8, // 圖片壓縮比例
    imgNewWidth = 1080, // 圖片新寬度
    img = new Image(),
    canvas = document.createElement("canvas"),
    context = canvas.getContext("2d"),
    file, 
    fileReader, 
    dataUrl;


// 遊戲設定
function initGame(board, oldStatus) {
    var board = board;
    var gameStatus = [];

    // 有舊資料就存入舊資料，否則依照board大小創造空白陣列
    if (oldStatus) {
        gameStatus = oldStatus;
    } else {
        var length = Math.pow(board, 2);
        for (var n = 0; n < length; n++) {
            gameStatus.push(0);
        }
    }

    return {
        update: function (num) {
            let n = num - 1;
            if (n < Math.pow(board, 2)) {
                gameStatus[n] = 1;
            }
        },
        check: function () {
            let checkStatus = []
            // 縱向判斷
            for (let n = 0; n < board; n++) {
                let temp = 0;
                for (let m = 0; m < board; m++) {
                    let x = n;
                    let y = m;
                    let z = x + y * board;
                    if (gameStatus[z] == 1) {
                        temp++;
                    }
                    // console.log(`x:${x}, y:${y}`)
                    // console.log(`gameStatus[${z}]`)
                }
                if (temp === board) {
                    checkStatus.push(`v${n}`);
                }
            }
            // 橫向判斷
            for (let n = 0; n < board; n++) {
                let temp = 0;
                for (let m = 0; m < board; m++
                ) {
                    let x = m;
                    let y = n;
                    let z = x + y * board;
                    if (gameStatus[z] == 1) {
                        temp++;
                    }
                }
                if (temp === board) {
                    checkStatus.push(`h${n}`);
                }
            }
            // 斜向判斷
            let check_topleft_to_bottomright = 0;
            let check_topright_to_bottomleft = 0;
            for (let n = 0; n < board; n++) {
                let x = n;
                let y = n;
                let z = x + y * board;
                let Z =
                    (y + 1) * board - (x + 1);
                if (gameStatus[z] == 1) {
                    check_topleft_to_bottomright++;
                }
                if (gameStatus[Z] == 1) {
                    check_topright_to_bottomleft++;
                }
                // console.log(`x:${x}, y:${y}`)
                // console.log(`gameStatus[${Z}]: ${gameStatus[Z]}`)
            }
            if (check_topleft_to_bottomright === board) {
                checkStatus.push(`x${1}`);   
            } 
            if (check_topright_to_bottomleft === board) {
                checkStatus.push(`x${2}`);
            }
            if (checkStatus) return checkStatus
            // 全部檢驗失敗
            return false;
        },
        show: function () {
            // return gameStatus
            for (let n = 0; n < board; n++) {
                let arr = [];
                for (
                    let m = 0;
                    m < board;
                    m++
                ) {
                    let pushTarget =
                        n * board + m;
                    arr.push(
                        gameStatus[pushTarget]
                    );
                }
                // console.log(arr);
            }
        },
    };
}
// Promise Ajax
function ajax(options) {
    return new Promise(function (
        resolve,
        reject
    ) {
        $.ajax(options)
            .done(resolve)
            .fail(reject);
    });
}
// 讀取input檔案
function readFile(input) {
    if (input.files && input.files[0]){
        file = input.files[0];
    } else {
        $("body").removeClass("lock")
        alert("瀏覽器不支援此功能！建議使用最新版本 Chrome");
        return;
    }
    
    if (file.type.indexOf("image") == 0) {
        var reader = new FileReader();
        reader.onload = function(e) {
            oldImgDataUrl = e.target.result;
            oldImg.src = oldImgDataUrl; // 載入 oldImg 取得圖片資訊
            myCrop.croppie("bind", {
                url: oldImgDataUrl
            });
        };
        
        reader.readAsDataURL(file);
    } else {
        $("body").removeClass("lock")
        alert("您上傳的不是圖檔！");
    }
}
// base64转blob
const base64ToBlob = function(base64Data) {
    let arr = base64Data.split(','),
        fileType = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        l = bstr.length,
        u8Arr = new Uint8Array(l);
        
    while (l--) {
        u8Arr[l] = bstr.charCodeAt(l);
    }
    return new Blob([u8Arr], {
        type: fileType
    });
};
// blob转file
const blobToFile = function(newBlob, fileName) {
    return new File([newBlob], fileName, { lastModified: new Date().getTime(), type: newBlob.type })
};
// 遊戲成功判斷 + 畫線
function checkAndDraw() {
    let checkStatus = bingo.check();
    // 成功連線
    if (checkStatus.length > 0) {
        console.log(checkStatus)
        $(".bingo").attr("style", "pointer-events: none;")
        let bingoHtml = $(".bingo")
       
        for (let i=0; i<checkStatus.length; i++) {
            let className = ""
            switch (checkStatus[i]) {
                case "v0" :
                    className = "vertical_fst active";
                    break;
                case "v1" :
                    className = "vertical_snd active";
                    break;
                case "v2" :
                    className = "vertical_trd active";
                    break;
                case "h0" :
                    className = "horizontal_fst active";
                    break;
                case "h1" :
                    className = "horizontal_snd active";
                    break;
                case "h2" :
                    className = "horizontal_trd active";
                    break;
                case "x1" :
                    className = "left_top__right_bottom active";
                    break;
                case "x2" :
                    className = "right_top__left_bottom active";
                    break;
                default :
                    break;
            }
            let lineHtml =  `<div class="bingo_line_box ${className}">
                                <div class="bingo_line"></div>
                            </div>`
            $(bingoHtml).append(lineHtml)
        }
        // 下方資訊更新
        $(".rules").addClass("d-none")
        $(".result").removeClass("active")
        $(".rules").removeClass("active")
        $(".result.complete").addClass("active")
        
    } 
}
// 開發時檢視圖片用(配合bingo.scss把.img_template的css刪掉才能看到)
function displayCropImg(src) {
    var html = "<img src='" + src + "' />";
    $("#newImg").html(html);
}
function displayNewImgInfo(src) {
    var html = "",
    filesize = src.length * 0.75;
    html += "<p>裁切圖片尺寸 " + width_crop + "x" + height_crop + "</p>";
    html += "<p>檔案大小約 " + Math.round(filesize / 1000) + "k</p>";
    $("#newImgInfo").html(html);
}


// ==================== step1 讀取使用者資料/設定遊戲 ====================
$(function() {
    function ajax(options) {
        return new Promise(function (
            resolve,
            reject
        ) {
            $.ajax(options)
                .done(resolve)
                .fail(reject);
        });
    }
    ajax({
        url: `${API_BASE_URL}/LoginMember`,
        type: "GET",
        success: function (res) {
            memberId = res.data.memberId;
        },
        error: function (res) {
            // console.log(res);
        },
    }).then(function () {
        ajax({
            url: `${API_BASE_URL}/Jiugongge`,
            type: "POST",
            data: {
                memberId: `${memberId}`,
            },
            success: function (res) {
                let datas = res.data.Jiugongge;
                let Completion = res.data.Completion;
                if (Completion) {
                    location.href="/prize.html"
                }
                var gameStatus = [];

                datas.forEach((data) => {
                    let Ranking = data.Ranking,
                        Id = data.Id,
                        Number = data.Number,
                        PhotoFilePath = data.PhotoFilePath;
                    $(`[data-ranking=${Ranking}]`).attr("id", Id); //設定格子Id
                    $(`[data-ranking=${Ranking}]`).attr("data-number",Number); //設定格子Id
                    $(`[data-ranking=${Ranking}] .num div`).text(Number); //設定格子正面顯示的數字
                    $(`[data-ranking=${Ranking}] .img_box div`).text(Number); //設定格子反面顯示的數字
                    if (PhotoFilePath !== "") {
                        $(`[data-ranking=${Ranking}] .img_box img`).attr("src",PhotoFilePath); //插入圖片
                    }
                    // 依照圖片設定遊戲狀態
                    if (PhotoFilePath !== "") {
                        gameStatus.push(1);
                    } else {
                        gameStatus.push(0);
                    }
                });
                bingo = initGame(board, gameStatus); // 初始化遊戲
                bingo.show(); //顯示遊戲
                checkAndDraw()
                // 有照片的格子翻開
                var n = 0;
                $(".bingo_table__item").each(
                    function () {
                        if ($(this).find(".img_box img").attr("src") !=="") {
                            setTimeout(() => {
                                $(this).addClass(
                                    "active"
                                );
                            }, n);
                            n = n + 200;
                        }
                    }
                );
            },
            error: function (res) {
                // console.log(res);
            },
        });
    });
});

// ==================== step2 使用者上傳圖片 ====================
$(function() {

    function clickOrScroll() {
        if(touchStartY!==touchMoveY) {
            return false;
        }else{
            return true
        }
    };
    let touchStartY,
        touchMoveY;
    $(".bingo_table__item").on("touchstart", function (e) {
        touchStartY = e.touches[0].clientY;
        touchMoveY = e.touches[0].clientY;
        // console.log("touchStartY : " + touchStartY)
    });
    $(".bingo_table__item").on("touchmove", function (e) {
        touchMoveY = e.touches[0].clientY;
        // console.log("touchMoveY : " + touchMoveY)
    });
    // 桌機
    $(".bingo_table__item").on("click", function () {
  
        if (!$(this).hasClass("active") && clickOrScroll()) {
            selectedNumber = $(this).data("number");
            $(".selected_number").text(selectedNumber);
            $(".upload").addClass("active");
        }
    });
    
    $("#upload_input").on("change", function() {
        $(".spinner_wrapper").addClass("active")
        $("body").addClass("lock")
        file = this.files[0];
        // 圖片才處理
        if (file && file.type.indexOf("image") == 0) {
            fileReader = new FileReader();
            fileReader.onload = getFileInfo;
            fileReader.readAsDataURL(file);
        }
    });
    function getFileInfo(evt) {
        dataUrl = evt.target.result,
        // 取得圖片
        img.src = dataUrl;
    }
        
    // 圖片載入後
    img.onload = function() {
        var width = this.width, // 圖片原始寬度
            height = this.height, // 圖片原始高度
            imgNewHeight = imgNewWidth * height / width, // 圖片新高度
            html = "",
            newImg;
        
        // 顯示預覽圖片
        html += "<img src='" + dataUrl + "'/>";
        html += "<p>這裡是原始圖片尺寸 " + width + "x" + height + "</p>";
        html += "<p>檔案大小約 " + Math.round(file.size / 1000) + "k</p>";
        $("#oldImg").html(html);
        
        // 使用 canvas 調整圖片寬高
        canvas.width = imgNewWidth;
        canvas.height = imgNewHeight;
        context.clearRect(0, 0, imgNewWidth, imgNewHeight);
        
        // 調整圖片尺寸
        context.drawImage(img, 0, 0, imgNewWidth, imgNewHeight);
        
        // 顯示新圖片
        newImg = canvas.toDataURL("image/jpeg", compressRatio);
        html = "";
        html += "<img src='" + newImg + "'/>";
        html += "<p>這裡是新圖片尺寸 " + imgNewWidth + "x" + imgNewHeight + "</p>";
        html += "<p>檔案大小約 " + Math.round(0.75 * newImg.length / 1000) + "k</p>"; // 出處 https://stackoverflow.com/questions/18557497/how-to-get-html5-canvas-todataurl-file-size-in-javascript
        $("#newImg").html(html);
        
        lastUploadImage = newImg
        // canvas 轉換為 blob 格式、上傳
        canvas.toBlob(function(blob) {
            let file = new File([blob], "fileName.jpg", { type: "image/jpeg" })
            var data = new FormData();
            // var file = $("#upload_input")[0].files[0]  //原檔測試用
            data.append("memberId", memberId);
            data.append("number", selectedNumber);
            data.append("photo", file);
            // ===== 上傳圖片API =====
                ajax({
                url: `${API_BASE_URL}/UploadPhoto`,
                type: "POST",
                data: data,
                contentType: false, // 必須
                processData: false, // 必須
                success: function (res) {
                    // console.log(res)
                    // 更新遊戲資料
                    let block = $(`[data-number=${selectedNumber}]`)
                    let ranking = $(block).attr("data-ranking")
                    switch(res.statusCode) {
                        // ===== 比對數字成功 =====
                        case 0 :
                            // 更新遊戲內部資料
                            bingo.update(ranking)
                            bingo.show()

                            // 圖片上傳區塊隱藏
                            $(".upload.active").removeClass("active")
                            
                            // 下方資訊更新
                            $(".result.active").removeClass("active")
                            $(".rules").addClass("d-none")
                            $(".result.succeed").addClass("active")
                            // 配對成功格子插入圖片並轉面
                            $(block).addClass("active").find("img").attr("src", `${lastUploadImage}`)
                            break;

                        // ===== 比對數字失敗 ===== 
                        case 5001 : 
                            // 下方資訊更新
                            $(".upload.active").removeClass("active")
                            $(".result.active").removeClass("active")
                            $(".rules").addClass("d-none")
                            $(".result.failed").addClass("active")
                            
                            break;

                        default :
                            $("#upload_input").val("")
                            break;
                    }
            
                },
                error: function (res) {
                    // console.log(res);
                },
            }).then(function (res) {
                $("body").removeClass("lock")
                $(".spinner_wrapper").removeClass("active")
                checkAndDraw()
                // 清空input(必要，避免上同張圖無法觸發onChange事件)
                $("#upload_input").val("")
            });
        }, "image/jpeg", compressRatio);
    };
    

});

// ==================== step3 監聽分享 ====================
$(function() {
    $(".line").on("click", function() {
        let shareCheck = bingo.check()
        if (shareCheck.length!==0) {
             // console.log("click")
            ajax({
                url: `${API_BASE_URL}/CompleteGame`,
                type: "POST",
                data: {
                    memberId: `${memberId}`,
                },
                success: function (res) {
                    if (res.statusCode === 0) location.href=`Completion` 
                },
                error: function (res) {
                    // console.log(res);
                },
            })
        }
       
    })
    // $(".download").on("click", function() {
    //     let shareCheck = bingo.check()
    //     if (shareCheck.length!==0) {
    //         // console.log("click")
    //        ajax({
    //            url: `${API_BASE_URL}/CompleteGame`,
    //            type: "POST",
    //            data: {
    //                memberId: `${memberId}`,
    //            },
    //            success: function (res) {
    //                if (res.statusCode === 0) location.href=`Completion`
    //                console.log(res.data) 
    //            },
    //            error: function (res) {
    //                // console.log(res);
    //            },
    //        })
    //    }
    // })  
    // 20220504 修改網頁版分享報錯
    $(".facebook").on("click", function() {
        FB.ui(
            {
                method: 'share',
                href: 'https://www.honda-taiwan.com.tw/SP/202205/', 
            },
            // callback
            function(response) {
                let shareCheck = bingo.check()           
                if (shareCheck.length!==0) {
                    alert('分享成功!');
                    // 20220504 更換 活動沒有用fb登入api，導致分享會報錯無法完成遊戲
                    // if (response && !response.error_message && shareCheck.length!==0) {
                    //     alert('分享成功!');
                    //     ajax({
                    //         url: `${API_BASE_URL}/CompleteGame`,
                    //         type: "POST",
                    //         data: {
                    //             memberId: `${memberId}`,
                    //         },
                    //         success: function (res) {
                    //             if (res.statusCode === 0) location.href=`Completion` 
                    //         },
                    //         error: function (res) {
                    //             // console.log(res);
                    //         },
                    //     })
                    // } else {
                    //     alert('分享失敗，請重新點選分享按鈕');
                    // }
                    // 換成只要點按鈕call分享api就算成功
                    ajax({
                        url: `${API_BASE_URL}/CompleteGame`,
                        type: "POST",
                        data: {
                            memberId: `${memberId}`,
                        },
                        success: function (res) {
                            if (res.statusCode === 0) location.href=`Completion` 
                        },
                        error: function (res) {
                            // console.log(res);
                        },
                    })
                }
            }
        );  
    })
})


