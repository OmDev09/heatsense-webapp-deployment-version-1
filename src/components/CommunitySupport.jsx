import { Phone, Mail, Globe, Droplets, Home, Activity, Megaphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CommunitySupport() {
  const { t } = useTranslation();
  
  const organizations = [
    {
      name: t('communitySupport.seeds.name'),
      type: t('communitySupport.seeds.type'),
      desc: t('communitySupport.seeds.desc'),
      phone: "+91-11-20904048",
      email: "info@seedsindia.org",
      website: "https://seedsindia.org",
      icon: <Home className="h-6 w-6" />,
      color: "bg-green-50 text-green-700 border-green-200",
      darkDesc: "dark:text-green-400"
    },
    {
      name: t('communitySupport.mht.name'),
      type: t('communitySupport.mht.type'),
      desc: t('communitySupport.mht.desc'),
      phone: "+91-79-2658-1111",
      website: "https://mahilahousingtrust.org",
      icon: <Droplets className="h-6 w-6" />,
      color: "bg-orange-50 text-orange-700 border-orange-200",
      darkDesc: "dark:text-orange-400"
    },
    {
      name: t('communitySupport.canal.name'),
      type: t('communitySupport.canal.type'),
      desc: t('communitySupport.canal.desc'),
      email: "eyesonthecanal@gmail.com",
      icon: <Activity className="h-6 w-6" />,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      darkDesc: "dark:text-blue-400"
    },
    {
      name: t('communitySupport.tndma.name'),
      type: t('communitySupport.tndma.type'),
      desc: t('communitySupport.tndma.desc'),
      isEmergency: true,
      contacts: [
        { label: t('communitySupport.tndma.disasterHelpline'), number: "1077" },
        { label: t('communitySupport.tndma.ambulance'), number: "108" },
        { label: t('communitySupport.tndma.healthAdvisory'), number: "104" }
      ],
      website: "https://tnsdma.tn.gov.in",
      icon: <Megaphone className="h-6 w-6" />,
      color: "bg-red-50 text-red-700 border-red-200",
      darkDesc: "dark:text-red-400"
    }
  ];
  return (
    <div className="w-full py-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        🤝 {t('communitySupport.title')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {organizations.map((org, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-xl border bg-opacity-40 shadow-sm hover:shadow-md transition-all dark:bg-neutral-800 dark:border-neutral-700 dark:bg-opacity-100 ${org.color}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/50 backdrop-blur-sm dark:bg-neutral-700 dark:text-neutral-100 [&>svg]:dark:text-inherit">
                  {org.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight dark:text-neutral-100">{org.name}</h3>
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-75 dark:text-neutral-400 dark:opacity-100">{org.type}</span>
                </div>
              </div>
            </div>

            <p className={`text-sm opacity-90 mb-4 leading-relaxed ${org.darkDesc || ''}`}>{org.desc}</p>

            <div className="flex flex-col gap-2 dark:text-neutral-200">
              {org.isEmergency ? (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {org.contacts.map(c => (
                    <a key={c.number} href={`tel:${c.number}`} className="flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition dark:bg-red-600 dark:hover:bg-red-500">
                      <Phone className="h-3 w-3" /> {c.label}: {c.number}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 text-sm font-medium">
                  {org.phone && <a href={`tel:${org.phone}`} className="flex items-center gap-1 hover:underline dark:text-neutral-200 dark:hover:text-neutral-100"><Phone className="h-3 w-3" /> {org.phone}</a>}
                  {org.email && <a href={`mailto:${org.email}`} className="flex items-center gap-1 hover:underline dark:text-neutral-200 dark:hover:text-neutral-100"><Mail className="h-3 w-3" /> {t('communitySupport.email')}</a>}
                  {org.website && <a href={org.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline dark:text-neutral-200 dark:hover:text-neutral-100"><Globe className="h-3 w-3" /> {t('communitySupport.website')}</a>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

