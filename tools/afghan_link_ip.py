from requests_html import HTMLSession
urls = [
    'https://www.afghanlive.tv/category/afghan-live-tv-channels/',
    'https://www.afghanlive.tv/category/afghan-live-tv-channels/page/2/']
sess = HTMLSession()
for url in urls:
    resp = sess.get(url)
    m = resp.html.find('.post-listing article h2 a')
    for link in m:
        resp_get_embed = sess.get(link.attrs['href'])
        m_embed = resp_get_embed.html.find('iframe', first=True)
        if m_embed:
            embed = m_embed.attrs['src']
            if 'afghantv.live' in embed:
                print(embed.replace('embed.html', 'index.m3u8'))
