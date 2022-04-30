$(function () {
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
    
    var width_crop = 320, // 圖片裁切寬度 px 值
        height_crop = 320, // 圖片裁切高度 px 值
        type_crop = "square", // 裁切形狀: square 為方形, circle 為圓形
        width_preview = 320, // 預覽區塊寬度 px 值
        height_preview = 320, // 預覽區塊高度 px 值
        compress_ratio = 0.5, // 圖片壓縮比例 0~1
        type_img = "jpeg", // 圖檔格式 jpeg png webp
        oldImg = new Image(),
        myCrop,
        file,
        oldImgDataUrl;

    // 裁切初始參數設定
    myCrop = $("#oldImg").croppie({
        viewport: {
            // 裁切區塊
            width: width_crop,
            height: height_crop,
            type: type_crop,
        },
        boundary: {
            // 預覽區塊
            width: width_preview,
            height: height_preview,
        },
    });
    
    function readFile(input) {
        if (input.files && input.files[0]) {
            file = input.files[0];
        } else {
            alert(
                "瀏覽器不支援此功能！建議使用最新版本 Chrome"
            );
            return;
        }

        if (file.type.indexOf("image") == 0) {
            var reader = new FileReader();

            reader.onload = function (e) {
                oldImgDataUrl = e.target.result;
                oldImg.src = oldImgDataUrl; // 載入 oldImg 取得圖片資訊
                myCrop.croppie("bind", {
                    url: oldImgDataUrl,
                });
            };

            reader.readAsDataURL(file);
        } else {
            alert("您上傳的不是圖檔！");
        }
    }

    function displayCropImg(src) {
        var html = "<img src='" + src + "' />";
        $("#newImg").html(html);
    }


    // ========== step2 使用者上傳圖片 ==========
    // 選取檔案 + 上傳
    const fileUploader = $("#upload_img");
    // 點卡片啟動上傳區塊
    $(".bingo_table__item").on(
        "click",
        function () {
            if (!$(this).hasClass("active")) {
                selectedNumber = $(this).data("number");
                $(".selectedNumber").text(selectedNumber);
                $(".upload").addClass("active");
            }
        }
    );

    $(fileUploader).on("change", (e) => {
        $("#oldImg").show();
        readFile(e.target);
        myCrop.croppie("result", {
            type: "canvas",
            format: type_img,
            quality: compress_ratio,
        }).then(function (src) {
            console.log(src)
            displayCropImg(src);
            displayNewImgInfo(src);
        });
        var formData = new FormData(
            $("#upload_form")[0]
        );
        var files = e.target.files;
        if (files.length > 0) {
            formData.append("memberId", memberId);
            formData.append("number", selectedNumber);
            formData.append("Photo", files[0]);
        }

        ajax({
            url: `${API_BASE_URL}/UploadPhoto`,
            type: "POST",
            data: formData,
            async: false,
            cache: false,
            contentType: false,
            processData: false,
            success: function (res) {
                console.log(res);
            },
            error: function (res) {
                console.log(res);
            },
        }).then(function (res) {
            console.log(res);
        });

        // 數字配對成功，讀取圖片資料放入九宮格
        // var reader = new FileReader();
        // reader.readAsDataURL(files[0]);
        // reader.onloadend = async function(e){
        //     $(`[data-number=${selectedNumber}]`).find(".img_box img").attr("src", e.target.result)
        //     $(`[data-number=${selectedNumber}]`).addClass("active")
        // }

        // $(".upload").removeClass("active")
    });

    oldImg.onload = function () {
    };

    // $("#crop_img").on("click", function () {
    //     myCrop
    //         .croppie("result", {
    //             type: "canvas",
    //             format: type_img,
    //             quality: compress_ratio,
    //         })
    //         .then(function (src) {
    //             displayCropImg(src);
    //         });
    // });
});


