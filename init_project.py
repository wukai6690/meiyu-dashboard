import os

# 1. 定义核心目录结构
directories = [
    "meiyu-dashboard/uniCloud-aliyun/cloudfunctions/evaluate_art",
    "meiyu-dashboard/uniCloud-aliyun/cloudfunctions/get_user_growth",
    "meiyu-dashboard/uniCloud-aliyun/cloudfunctions/save_artwork",
    "meiyu-dashboard/uniCloud-aliyun/database",
    "meiyu-dashboard/src/components/radar-chart",
    "meiyu-dashboard/src/components/growth-line-chart",
    "meiyu-dashboard/src/components/score-card",
    "meiyu-dashboard/src/pages/index",
    "meiyu-dashboard/src/pages/upload",
    "meiyu-dashboard/src/pages/dashboard",
    "meiyu-dashboard/src/pages/history",
    "meiyu-dashboard/src/static/images",
    "meiyu-dashboard/src/utils"
]

# 2. 定义需要预置的空文件
files = [
    "meiyu-dashboard/uniCloud-aliyun/cloudfunctions/evaluate_art/index.js",
    "meiyu-dashboard/uniCloud-aliyun/cloudfunctions/evaluate_art/package.json",
    "meiyu-dashboard/uniCloud-aliyun/database/k12_users.schema.json",
    "meiyu-dashboard/uniCloud-aliyun/database/k12_artworks.schema.json",
    "meiyu-dashboard/src/utils/score_calculator.js",
    "meiyu-dashboard/src/utils/feedback_dict.js",
    "meiyu-dashboard/src/App.vue",
    "meiyu-dashboard/src/main.js",
    "meiyu-dashboard/src/manifest.json",
    "meiyu-dashboard/src/pages.json",
    "meiyu-dashboard/package.json",
    "meiyu-dashboard/vite.config.js",
    "meiyu-dashboard/.gitignore"
]

def build_project():
    print("🚀 正在一键生成《美育观止》项目结构...")
    
    # 批量创建目录
    for d in directories:
        os.makedirs(d, exist_ok=True)
        
    # 批量创建文件
    for f in files:
        # 如果文件不存在，则创建空文件
        if not os.path.exists(f):
            with open(f, 'w', encoding='utf-8') as file:
                # 可以在这里给 .gitignore 预写一点基础配置
                if f.endswith('.gitignore'):
                    file.write("node_modules/\n.DS_Store\nuniCloud-aliyun/cloudfunctions/**/node_modules/\n")
                else:
                    pass

    print("✅ 搞定！项目骨架已生成完毕。")
    print("👉 接下来：请在 VS Code 中选择【文件】->【打开文件夹】，直接打开刚刚生成的 'meiyu-dashboard' 文件夹即可开始编码！")

if __name__ == '__main__':
    build_project()