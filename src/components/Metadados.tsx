import heptaLatin from '@fontsource-variable/hepta-slab/files/hepta-slab-latin-wght-normal.woff2?url'
import { Head } from 'vite-react-ssg/single-page'
import { conteudo } from '../data/conteudo.ts'
import { fatos } from '../data/fatos.ts'

const URL_SITE = `${fatos.siteUrl}/`
const IMAGEM_OG = `${fatos.siteUrl}/img/og.jpg`
const ID_CLINICA = `${URL_SITE}#clinica`
const ID_MEDICA = `${URL_SITE}#medica`
const { endereco, horario, telefone, geo, redes } = fatos

const DIAS_UTEIS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

function periodo(dias: string[], faixa: { abre: string; fecha: string }) {
  return { '@type': 'OpeningHoursSpecification', dayOfWeek: dias, opens: faixa.abre, closes: faixa.fecha }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalClinic',
      '@id': ID_CLINICA,
      name: fatos.nomeClinica,
      url: URL_SITE,
      image: IMAGEM_OG,
      telephone: telefone.tel,
      address: {
        '@type': 'PostalAddress',
        streetAddress: endereco.linha,
        addressLocality: endereco.cidade,
        addressRegion: endereco.uf,
        postalCode: endereco.cep,
        addressCountry: 'BR',
      },
      geo: { '@type': 'GeoCoordinates', latitude: geo.latitude, longitude: geo.longitude },
      openingHoursSpecification: [
        periodo(DIAS_UTEIS, horario.segSex),
        periodo(['Saturday'], horario.sab),
        periodo(['Sunday'], horario.dom),
      ],
      sameAs: [redes.instagram, redes.facebook],
      member: { '@id': ID_MEDICA },
    },
    {
      '@type': 'Physician',
      '@id': ID_MEDICA,
      name: fatos.nomeMedica,
      description: fatos.especialidade,
      identifier: { '@type': 'PropertyValue', name: 'CRM', value: fatos.crm },
      telephone: telefone.tel,
      address: { '@type': 'PostalAddress', addressLocality: endereco.cidade, addressRegion: endereco.uf, addressCountry: 'BR' },
    },
  ],
}

export function Metadados() {
  const { titulo, descricao } = conteudo.seo
  return (
    <Head>
      {/* O SSG põe o Head logo após <head>: o charset fica aqui para cair nos primeiros 1024 bytes. */}
      <meta charSet="UTF-8" />
      <title>{titulo}</title>
      <meta name="description" content={descricao} />
      <link rel="canonical" href={URL_SITE} />
      <link rel="preload" as="font" type="font/woff2" href={heptaLatin} crossOrigin="anonymous" />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content={fatos.nomeClinica} />
      <meta property="og:title" content={titulo} />
      <meta property="og:description" content={descricao} />
      <meta property="og:url" content={URL_SITE} />
      <meta property="og:image" content={IMAGEM_OG} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={conteudo.alt.imagemOg} />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Head>
  )
}
