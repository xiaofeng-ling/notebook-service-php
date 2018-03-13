(function () {
    var step = 100, is_end = false, notebook_id = sessionStorage.notebook_id;

    var echoError = function (result) {
        if (result.status === 422) { // 数据验证失败
            var errors = result.responseJSON.errors;

            for (var error in errors) {
                alert(errors[error]);      // todo 先临时这么写，具体的错误提示等到之后再弄
            }
        }
    };

    /**
     * 加载标题
     * @param notebook_id
     */
    var loadTitle = function (notebook_id) {
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: '/notebook/getList',
            type: "POST",
            data: {
                notebook_id: notebook_id,
                start: 0,
                end: step
            },

            dataType: 'json',

            success: function (result) {
                for (var i = 0; i < result.length; i++) {
                    var li = $("<li></li>").text(result[i].title);
                    li.attr({
                        'data-id': result[i].id,
                        'updated-at': result[i].updated_at
                    });

                    // 绑定点击事件
                    li.click(function (e) {
                        var self = $(this);
                        loadContent(self.attr('data-id'));
                    });

                    $(".list > ul").append(li)
                }
            }
        });
    };

    /**
     * 滚动加载
     * @param notebook_id
     * @param force  强制请求，忽略is_end
     * @returns {boolean}
     */
    var loadNext = function (notebook_id, force) {
        if (is_end && !force)
            return is_end;

        start = $(".list > ul").children().length;

        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: '/notebook/getList',
            type: "POST",
            data: {
                notebook_id: notebook_id,
                start: start,
                end: start + step
            },

            dataType: 'json',

            success: function (result) {
                // 已经到底了
                if (result.length === 0)
                    is_end = true;
                for (var i = 0; i < result.length; i++) {
                    var li = $("<li></li>").text(result[i].title);
                    li.attr({
                        'data-id': result[i].id,
                        'updated-at': result[i].updated_at
                    });

                    // 绑定点击事件
                    li.click(function (e) {
                        var self = $(this);
                        loadContent(self.attr('data-id'));
                    });

                    $(".list > ul").append(li)
                }
            }
        });
    };

    /**
     * 加载内容
     * @param id
     */
    var loadContent = function (id) {
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: '/notebook/' + id,

            dataType: 'json',

            success: function (result) {
                $('.text').val(result.content);
                $('.select').removeClass('select');
                $("[data-id='" + id + "'").addClass('select');
            }
        });
    };

    /**
     * 保存内容，会涉及到冲突的处理
     * @param notebook_id
     * @param id
     * @param updated_at
     */
    var saveContent = function (notebook_id, id, updated_at) {
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: '/notebook/' + id,
            type: "PUT",
            data: {
                notebook_id: notebook_id,
                content: $(".text").val(),
                title: $("[data-id='" + id + "'").text(),
                updated_at: updated_at
            },

            dataType: 'json',

            success: function (result) {
                if (result.code === 0) {
                    alert("保存成功!");
                }
                else if (result.code === 2) {
                    alert("文件已被修改，有冲突");
                    loadNext(notebook_id, true);
                }
            },

            error: echoError
        });
    };

    /**
     * 软删除一页日记
     * @param id
     */
    var deletePage = function (id) {
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: '/notebook/' + id,

            type: "DELETE",

            dataType: 'json',

            success: function (result) {
                if (result.code === 0) {
                    $("[data-id='" + id + "'").remove();
                    alert("删除成功");
                }
                else
                    alert(result.data)
            }
        });
    };

    /**
     * 新建一页日记
     * @param notebook_id
     * @param title
     * @param content
     * @returns {boolean}
     */
    var createPage = function (notebook_id, title, content) {
        if (title === undefined || title === '') {
            alert("请输入标题！");
            return false;
        }

        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: '/notebook',
            type: "POST",
            data: {
                notebook_id: notebook_id,
                title: title
            },

            dataType: 'json',

            success: function (result) {
                if (result.code === 0) {
                    loadNext(notebook_id, true);
                }
            },

            error: echoError
        });
    };

    var getSelectObject = function () {
        return $(".select");
    };

    var modifyTitle = function(title) {
        if (title === undefined || title === '') {
            alert("请输入标题！");
            return false;
        }

        id = getSelectObject().attr('data-id');

        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: '/notebook/modifyTitle/'+ id,
            type: "POST",
            data: {
                title: title
            },

            dataType: 'json',

            success: function (result) {
                if (result.code === 0) {
                    getSelectObject().text(title);
                }
            },

            error: echoError
        });
    }

    /**
     * 全局初始化
     */
    $(window).ready(function (e) {
        loadTitle(notebook_id);

        $("#create").click(function (e) {
            var title = prompt("请输入标题");

            if (title !== null) {
                createPage(notebook_id, title);
            }
        });

        $("#delete").click(function (e) {
            deletePage(getSelectObject().attr('data-id'));
        });

        $("#save").click(function (e) {
            saveContent(notebook_id, getSelectObject().attr('data-id'), getSelectObject().attr('updated-at'));
        });

        $("#modify").click(function (e) {
            var title = prompt("请输入标题");

            if (title !== null) {
                modifyTitle(title);
            }
        });
    });

})();