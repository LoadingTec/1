import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "MAXSYS",
  description: "精心打造的个人导航网站，它犹如一座数字桥梁，将用户与丰富多样的网络资源紧密相连。简洁而直观的界面设计，让用户能够轻松地在各个分类之间穿梭。",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Mission', link: '/mission' },
      { text: 'My WorkSpace', link: 'https://vsc.xqiye.com/?workspace=/root/myvsc.code-workspace' },
      { text: 'NAS', link: 'https://ainas.le1e.com' },
      { text: 'Gitlab', link: 'https://gitlab.le1e.com' },
{text:'DotNet',link:'https://learn.microsoft.com/zh-cn/dotnet/csharp/?WT.mc_id=dotnet-35129-website'}

    ],

    sidebar: [
      {
        text: 'Articles',
        items: [
          { text: 'Inspection System', link: '/articles/inspection-system/AOI-AF.md'},
          { text: 'Yiled Management System', link: '/articles/yms/ivy.md' },
          { text: 'AIG', link: '/articles/AIG/2024-12-19.md' }
        ]
      },
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      },
      {
        text: 'AIG',
        collapsed: false,
        items: [
          { text: 'AIGA', link: '/articles/AIG/' }
        ]
      },
      {
        text: 'Notes',
        collapsed: false,
        items: [
          { text: 'note', link: '/articles/note' },
          { text: 'System Managenet', link: '/articles/系统管理/论努力和系统管理.md' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/robyle' }
    ]
  }
})
