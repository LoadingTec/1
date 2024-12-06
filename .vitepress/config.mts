import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Roby's Nav",
  description: "我的公开导航页面",
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
