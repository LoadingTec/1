import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "我的导航",
  description: "精心打造的个人导航网站，它犹如一座数字桥梁，将用户与丰富多样的网络资源紧密相连。简洁而直观的界面设计，让用户能够轻松地在各个分类之间穿梭。",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
      { text: 'VSC Online', link: 'https://vsc.le1e.com' },
{text:'DotNet',link:'https://learn.microsoft.com/zh-cn/dotnet/csharp/?WT.mc_id=dotnet-35129-website'}

    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/robyle' }
    ]
  }
})
