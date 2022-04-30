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
    var width_crop = 320, // 圖片裁切寬度 px 值
        height_crop = 320, // 圖片裁切高度 px 值
        type_crop = "square", // 裁切形狀: square 為方形, circle 為圓形
        width_preview = 320, // 預覽區塊寬度 px 值
        height_preview = 320, // 預覽區塊高度 px 值
        compress_ratio = 0.85, // 圖片壓縮比例 0~1
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
    $("#crop_img").on("click", function () {
        console.log("clicked")
        myCrop
            .croppie("result", {
                type: "canvas",
                format: type_img,
                quality: compress_ratio,
            })
            .then(function (src) {
                displayCropImg(src);
                displayNewImgInfo(src);
            });
    });
    $("#upload_img").on("change", function () {
        $("#oldImg").show();
        readFile(this);
        $("#crop_img").trigger("click")
    });

    oldImg.onload = function () {
        var width = this.width,
            height = this.height,
            fileSize = Math.round(
                file.size / 1000
            ),
            html = "";

        html +=
            "<p>原始圖片尺寸 " +
            width +
            "x" +
            height +
            "</p>";
        html +=
            "<p>檔案大小約 " + fileSize + "k</p>";
        $("#oldImg").before(html);
    };

    function displayNewImgInfo(src) {
        var html = "",
            filesize = src.length * 0.75;

        html +=
            "<p>裁切圖片尺寸 " +
            width_crop +
            "x" +
            height_crop +
            "</p>";
        html +=
            "<p>檔案大小約 " +
            Math.round(filesize / 1000) +
            "k</p>";
        $("#newImgInfo").html(html);
    }


});

myCrop
    .croppie("result", {
        type: "canvas",
        format: type_img,
        quality: compress_ratio,
    })
    .then(function (src) {
        displayCropImg(src);
        // $(".upload").removeClass("active")
        // $(".rules").addClass("d-none")
        // $(".result.succeed").addClass("active")

        // var formData = new FormData();
        // formData.append('filename', $("#upload_img")[0].files[0]);
        $.ajax({
            type: "POST",
            url: asePath + "/upload.action",
            data: { image: resp },
            complete: function () {
                console.log("complete");
            },
            error: function () {
                console.log("error");
            },
        }).done(function (res) {});
    });
