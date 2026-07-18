import { MemberRolesEnum } from 'src/enums/member.enum'

interface SeedMultiLangText {
	ro: string
	ru: string
	en: string
}

export interface SeedMember {
	name: SeedMultiLangText
	shortDetails: SeedMultiLangText
	// Only the President has a `details` (long bio) entry — everyone else's public
	// listing uses shortDetails only, mirroring the schema (`details` is optional,
	// President-only).
	details?: SeedMultiLangText
	roles: MemberRolesEnum[]
}

// One-time bulk import built from membri.txt, merging the same person's multiple
// section listings (spelling/name-order variants resolved by hand) onto a single
// record with a combined `roles` array. Person/place/organization names and
// acronyms (SRL, AO, G.Ț., Î.I., IDNO/IDNP, GAL) are kept identical across all
// three languages — only the generic role/administrative words are translated.
export const MEMBER_SEED_DATA: SeedMember[] = [
	{
		name: { ro: 'Badan Tatiana', ru: 'Бадан Татьяна', en: 'Badan Tatiana' },
		shortDetails: {
			ro: 'Primăria satului Selemet, primar, IDNO/IDNP: 1007601008801',
			ru: 'Мэрия села Selemet, мэр, IDNO/IDNP: 1007601008801',
			en: 'Selemet Village Town Hall, mayor, IDNO/IDNP: 1007601008801'
		},
		details: {
			ro: 'Tatiana Badan este președinta Grupului de Acțiune Locală „Stejarul Dacilor”, cu o vastă experiență în administrația publică locală și în coordonarea proiectelor de dezvoltare rurală. De-a lungul activității sale, a contribuit activ la consolidarea parteneriatului dintre autoritățile publice locale, mediul de afaceri și societatea civilă din regiune.',
			ru: 'Татьяна Бадан является президентом Группы местных действий «Stejarul Dacilor», обладает обширным опытом работы в местном публичном управлении и координации проектов сельского развития. На протяжении своей деятельности она активно способствовала укреплению партнёрства между местными органами публичной власти, деловой средой и гражданским обществом региона.',
			en: 'Tatiana Badan is the President of the Local Action Group "Stejarul Dacilor", with extensive experience in local public administration and in coordinating rural development projects. Throughout her career, she has actively contributed to strengthening the partnership between local public authorities, the business community, and civil society in the region.'
		},
		roles: [
			MemberRolesEnum.PRESIDENT,
			MemberRolesEnum.GENERAL_ASSEMBLY,
			MemberRolesEnum.ADMINISTRATION,
			MemberRolesEnum.SELECTION_COMMITTEE
		]
	},
	{
		name: { ro: 'Televca Aliona', ru: 'Телевка Алёна', en: 'Televca Aliona' },
		shortDetails: {
			ro: 'Director executiv GAL "Stejarul Dacilor"',
			ru: 'Исполнительный директор, GAL "Stejarul Dacilor"',
			en: 'Executive Director, GAL "Stejarul Dacilor"'
		},
		roles: [MemberRolesEnum.EXECUTIVE_BODY]
	},
	{
		name: { ro: 'Grigoriță Ludmila', ru: 'Григорицэ Людмила', en: 'Grigoriță Ludmila' },
		shortDetails: {
			ro: 'Manager GAL "Stejarul Dacilor"',
			ru: 'Менеджер, GAL "Stejarul Dacilor"',
			en: 'Manager, GAL "Stejarul Dacilor"'
		},
		roles: [MemberRolesEnum.EXECUTIVE_BODY]
	},
	{
		name: { ro: 'Milcev Ana', ru: 'Милчев Ана', en: 'Milcev Ana' },
		shortDetails: {
			ro: 'Contabil GAL "Stejarul Dacilor"',
			ru: 'Бухгалтер, GAL "Stejarul Dacilor"',
			en: 'Accountant, GAL "Stejarul Dacilor"'
		},
		roles: [MemberRolesEnum.EXECUTIVE_BODY]
	},
	{
		name: { ro: 'Spânu Valeriu', ru: 'Спыну Валериу', en: 'Spânu Valeriu' },
		shortDetails: {
			ro: 'Primăria comunei Codreni, primar, IDNO/IDNP: 1007601005903',
			ru: 'Мэрия коммуны Codreni, мэр, IDNO/IDNP: 1007601005903',
			en: 'Codreni Commune Town Hall, mayor, IDNO/IDNP: 1007601005903'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY, MemberRolesEnum.SELECTION_COMMITTEE]
	},
	{
		name: { ro: 'Spânu Anatolie', ru: 'Спыну Анатолие', en: 'Spânu Anatolie' },
		shortDetails: {
			ro: 'Primăria satului Batîr, primar, IDNO/IDNP: 1007601005899',
			ru: 'Мэрия села Batîr, мэр, IDNO/IDNP: 1007601005899',
			en: 'Batîr Village Town Hall, mayor, IDNO/IDNP: 1007601005899'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Pârlog Sergiu', ru: 'Пырлог Сергиу', en: 'Pârlog Sergiu' },
		shortDetails: {
			ro: 'Primăria satului Ciuflești, primar, IDNO/IDNP: 1007601005198',
			ru: 'Мэрия села Ciuflești, мэр, IDNO/IDNP: 1007601005198',
			en: 'Ciuflești Village Town Hall, mayor, IDNO/IDNP: 1007601005198'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY, MemberRolesEnum.ADMINISTRATION]
	},
	{
		name: { ro: 'Ciobanu Svetlana', ru: 'Чобану Светлана', en: 'Ciobanu Svetlana' },
		shortDetails: {
			ro: 'Primăria comunei Ecaterinovca, primar, IDNO/IDNP: 1007601008845',
			ru: 'Мэрия коммуны Ecaterinovca, мэр, IDNO/IDNP: 1007601008845',
			en: 'Ecaterinovca Commune Town Hall, mayor, IDNO/IDNP: 1007601008845'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY, MemberRolesEnum.CENSORSHIP_COMMITTEE]
	},
	{
		name: { ro: 'Faureanu Iurie', ru: 'Фауряну Юрие', en: 'Faureanu Iurie' },
		shortDetails: {
			ro: 'Primăria comunei Porumbrei, primar, IDNO/IDNP: 1007601005925',
			ru: 'Мэрия коммуны Porumbrei, мэр, IDNO/IDNP: 1007601005925',
			en: 'Porumbrei Commune Town Hall, mayor, IDNO/IDNP: 1007601005925'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY, MemberRolesEnum.SELECTION_COMMITTEE]
	},
	{
		name: { ro: 'Cucereavâi Vladimir', ru: 'Кучерявый Владимир', en: 'Cucereavâi Vladimir' },
		shortDetails: {
			ro: 'Primăria satului Taraclia, primar, IDNO/IDNP: 1007601003792',
			ru: 'Мэрия села Taraclia, мэр, IDNO/IDNP: 1007601003792',
			en: 'Taraclia Village Town Hall, mayor, IDNO/IDNP: 1007601003792'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY, MemberRolesEnum.ADMINISTRATION]
	},
	{
		name: { ro: 'Cojocaru Ion', ru: 'Кожокару Ион', en: 'Cojocaru Ion' },
		shortDetails: {
			ro: 'Primăria satului Sagaidac, primar, IDNO/IDNP: 1007601005660',
			ru: 'Мэрия села Sagaidac, мэр, IDNO/IDNP: 1007601005660',
			en: 'Sagaidac Village Town Hall, mayor, IDNO/IDNP: 1007601005660'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Bumbu Marin', ru: 'Бумбу Марин', en: 'Bumbu Marin' },
		shortDetails: {
			ro: 'Primăria satului Satul Nou, primar, IDNO/IDNP: 1007601008926',
			ru: 'Мэрия села Satul Nou, мэр, IDNO/IDNP: 1007601008926',
			en: 'Satul Nou Village Town Hall, mayor, IDNO/IDNP: 1007601008926'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Ghenciu Alexandru', ru: 'Генчиу Александру', en: 'Ghenciu Alexandru' },
		shortDetails: {
			ro: 'Primăria satului Suric, primar, IDNO/IDNP: 1007601008694',
			ru: 'Мэрия села Suric, мэр, IDNO/IDNP: 1007601008694',
			en: 'Suric Village Town Hall, mayor, IDNO/IDNP: 1007601008694'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Sturza Alexandru', ru: 'Стурза Александру', en: 'Sturza Alexandru' },
		shortDetails: {
			ro: 'Primăria satului Mihailovca, primar, IDNO/IDNP: 1007601008834',
			ru: 'Мэрия села Mihailovca, мэр, IDNO/IDNP: 1007601008834',
			en: 'Mihailovca Village Town Hall, mayor, IDNO/IDNP: 1007601008834'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY, MemberRolesEnum.SELECTION_COMMITTEE]
	},
	{
		name: { ro: 'Lungu Ion', ru: 'Лунгу Ион', en: 'Lungu Ion' },
		shortDetails: {
			ro: 'G.Ț. „Lungu Ion Nicolae s. Porumbrei”, conducător, IDNO/IDNP: 34955440',
			ru: 'G.Ț. «Lungu Ion Nicolae s. Porumbrei», руководитель, IDNO/IDNP: 34955440',
			en: 'G.Ț. "Lungu Ion Nicolae s. Porumbrei", head, IDNO/IDNP: 34955440'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Strogoțeanu Efim', ru: 'Строгоцяну Ефим', en: 'Strogoțeanu Efim' },
		shortDetails: {
			ro: 'G.Ț. „Gaibu Serghei Fiodor”, angajat, IDNO/IDNP: 34613445',
			ru: 'G.Ț. «Gaibu Serghei Fiodor», сотрудник, IDNO/IDNP: 34613445',
			en: 'G.Ț. "Gaibu Serghei Fiodor", employee, IDNO/IDNP: 34613445'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY, MemberRolesEnum.SELECTION_COMMITTEE]
	},
	{
		name: { ro: 'Baidu Stele', ru: 'Байду Стеле', en: 'Baidu Stele' },
		shortDetails: {
			ro: 'Primăria satului Valea Perjei, primar, IDNO/IDNP: 1007601008812',
			ru: 'Мэрия села Valea Perjei, мэр, IDNO/IDNP: 1007601008812',
			en: 'Valea Perjei Village Town Hall, mayor, IDNO/IDNP: 1007601008812'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Bâlba Vasile', ru: 'Былба Василе', en: 'Bâlba Vasile' },
		shortDetails: {
			ro: 'G.Ț. "Bîlba Vasile", administrator, IDNO/IDNP: 1024605000387',
			ru: 'G.Ț. «Bîlba Vasile», администратор, IDNO/IDNP: 1024605000387',
			en: 'G.Ț. "Bîlba Vasile", administrator, IDNO/IDNP: 1024605000387'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Vivat Seveleac Ileana', ru: 'Виват Севеляк Иляна', en: 'Vivat Seveleac Ileana' },
		shortDetails: {
			ro: 'AO Băștinașilor satul Valea Perjei, membră, IDNO/IDNP: 1023620002211',
			ru: 'AO Băștinașilor, село Valea Perjei, член, IDNO/IDNP: 1023620002211',
			en: 'AO Băștinașilor, Valea Perjei village, member, IDNO/IDNP: 1023620002211'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Crețu Ion', ru: 'Крецу Ион', en: 'Crețu Ion' },
		shortDetails: {
			ro: 'Primăria comunei Răzeni, primar, IDNO/IDNP: 1007601006944',
			ru: 'Мэрия коммуны Răzeni, мэр, IDNO/IDNP: 1007601006944',
			en: 'Răzeni Commune Town Hall, mayor, IDNO/IDNP: 1007601006944'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Postică Ion', ru: 'Постикэ Ион', en: 'Postică Ion' },
		shortDetails: {
			ro: 'SRL "Baciu-Caprine", administrator, IDNO/IDNP: 1024608004205',
			ru: 'SRL «Baciu-Caprine», администратор, IDNO/IDNP: 1024608004205',
			en: 'SRL "Baciu-Caprine", administrator, IDNO/IDNP: 1024608004205'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Chiosa Andrei', ru: 'Киоса Андрей', en: 'Chiosa Andrei' },
		shortDetails: {
			ro: 'AO AA "Apis-Răzeni", conducător, IDNO/IDNP: 1019620000252',
			ru: 'AO AA «Apis-Răzeni», руководитель, IDNO/IDNP: 1019620000252',
			en: 'AO AA "Apis-Răzeni", head, IDNO/IDNP: 1019620000252'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Juganari Vitalie', ru: 'Жуганари Виталие', en: 'Juganari Vitalie' },
		shortDetails: {
			ro: 'G.Ț. „Juganari Vitalie Ion”, conducător, IDNO/IDNP: 34829445',
			ru: 'G.Ț. «Juganari Vitalie Ion», руководитель, IDNO/IDNP: 34829445',
			en: 'G.Ț. "Juganari Vitalie Ion", head, IDNO/IDNP: 34829445'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Cojocaru Nadejda', ru: 'Кожокару Надежда', en: 'Cojocaru Nadejda' },
		shortDetails: {
			ro: 'Î.I. „Cojocari Ion”, angajată, IDNO/IDNP: 1003605150881',
			ru: 'Î.I. «Cojocari Ion», сотрудник, IDNO/IDNP: 1003605150881',
			en: 'Î.I. "Cojocari Ion", employee, IDNO/IDNP: 1003605150881'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Jaloba Larisa', ru: 'Жалоба Лариса', en: 'Jaloba Larisa' },
		shortDetails: {
			ro: 'Î.I. „CRIZANTEMĂ-JALOBA”, administrator, IDNO/IDNP: 1005605000980',
			ru: 'Î.I. «CRIZANTEMĂ-JALOBA», администратор, IDNO/IDNP: 1005605000980',
			en: 'Î.I. "CRIZANTEMĂ-JALOBA", administrator, IDNO/IDNP: 1005605000980'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY, MemberRolesEnum.SELECTION_COMMITTEE]
	},
	{
		name: { ro: 'Spânu Tatiana', ru: 'Спыну Татьяна', en: 'Spânu Tatiana' },
		shortDetails: {
			ro: 'Î.I. „Spînu Valeriu”, administrator, IDNO/IDNP: 1003605151224',
			ru: 'Î.I. «Spînu Valeriu», администратор, IDNO/IDNP: 1003605151224',
			en: 'Î.I. "Spînu Valeriu", administrator, IDNO/IDNP: 1003605151224'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Munteanu Andrei', ru: 'Мунтяну Андрей', en: 'Munteanu Andrei' },
		shortDetails: {
			ro: 'SRL „Alexpromun”, administrator, IDNO/IDNP: 1007605001877',
			ru: 'SRL «Alexpromun», администратор, IDNO/IDNP: 1007605001877',
			en: 'SRL "Alexpromun", administrator, IDNO/IDNP: 1007605001877'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY, MemberRolesEnum.SELECTION_COMMITTEE]
	},
	{
		name: { ro: 'Cecoi Constantin', ru: 'Чекой Константин', en: 'Cecoi Constantin' },
		shortDetails: {
			ro: 'Primăria satului Cărbuna, primar, IDNO/IDNP: 1009601000083',
			ru: 'Мэрия села Cărbuna, мэр, IDNO/IDNP: 1009601000083',
			en: 'Cărbuna Village Town Hall, mayor, IDNO/IDNP: 1009601000083'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Spânu Valentina', ru: 'Спыну Валентина', en: 'Spânu Valentina' },
		shortDetails: {
			ro: 'G.Ț. „Spînu Valentina”, administrator, IDNO/IDNP: 1003605151224',
			ru: 'G.Ț. «Spînu Valentina», администратор, IDNO/IDNP: 1003605151224',
			en: 'G.Ț. "Spînu Valentina", administrator, IDNO/IDNP: 1003605151224'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Delendrea Victor', ru: 'Делендря Виктор', en: 'Delendrea Victor' },
		shortDetails: {
			ro: 'SRL „Delendrea Victor”, administrator, IDNO/IDNP: 1023608000484',
			ru: 'SRL «Delendrea Victor», администратор, IDNO/IDNP: 1023608000484',
			en: 'SRL "Delendrea Victor", administrator, IDNO/IDNP: 1023608000484'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Inculeț Aliona', ru: 'Инкулец Алёна', en: 'Inculeț Aliona' },
		shortDetails: {
			ro: 'AO „Centrul de Istorie, Cultură și Dezvoltare Comunitară Ghiocel de Cărbuna”, președinte, IDNO/IDNP: 1019620005453',
			ru: 'AO «Centrul de Istorie, Cultură și Dezvoltare Comunitară Ghiocel de Cărbuna», председатель, IDNO/IDNP: 1019620005453',
			en: 'AO "Centrul de Istorie, Cultură și Dezvoltare Comunitară Ghiocel de Cărbuna", president, IDNO/IDNP: 1019620005453'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Cearca Tatiana', ru: 'Чарка Татьяна', en: 'Cearca Tatiana' },
		shortDetails: {
			ro: 'AO „Centrul de Tineret pentru Cultură, Artă și Istorie”, membră, IDNO/IDNP: 1025620007678',
			ru: 'AO «Centrul de Tineret pentru Cultură, Artă și Istorie», член, IDNO/IDNP: 1025620007678',
			en: 'AO "Centrul de Tineret pentru Cultură, Artă și Istorie", member, IDNO/IDNP: 1025620007678'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Erizan Sergiu', ru: 'Еризан Сергиу', en: 'Erizan Sergiu' },
		shortDetails: {
			ro: 'Primăria satului Cigîrleni, primar, IDNO/IDNP: 1008601000189',
			ru: 'Мэрия села Cigîrleni, мэр, IDNO/IDNP: 1008601000189',
			en: 'Cigîrleni Village Town Hall, mayor, IDNO/IDNP: 1008601000189'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Talmaci Mircea', ru: 'Талмачи Мирча', en: 'Talmaci Mircea' },
		shortDetails: {
			ro: 'SRL „Agrocimtal”, administrator, IDNO/IDNP: 1017605002462',
			ru: 'SRL «Agrocimtal», администратор, IDNO/IDNP: 1017605002462',
			en: 'SRL "Agrocimtal", administrator, IDNO/IDNP: 1017605002462'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY, MemberRolesEnum.ADMINISTRATION]
	},
	{
		name: { ro: 'Prodius Nicolae', ru: 'Продиус Николае', en: 'Prodius Nicolae' },
		shortDetails: {
			ro: 'SRL „Rodinic-Service”, administrator, IDNO/IDNP: 1004605006619',
			ru: 'SRL «Rodinic-Service», администратор, IDNO/IDNP: 1004605006619',
			en: 'SRL "Rodinic-Service", administrator, IDNO/IDNP: 1004605006619'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY, MemberRolesEnum.CENSORSHIP_COMMITTEE]
	},
	{
		name: { ro: 'Sturza Elena', ru: 'Стурза Елена', en: 'Sturza Elena' },
		shortDetails: {
			ro: 'SRL „UNIVECAS”, administrator, IDNO/IDNP: 1014605002520',
			ru: 'SRL «UNIVECAS», администратор, IDNO/IDNP: 1014605002520',
			en: 'SRL "UNIVECAS", administrator, IDNO/IDNP: 1014605002520'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Țurcanu Oxana', ru: 'Цуркану Оксана', en: 'Țurcanu Oxana' },
		shortDetails: {
			ro: 'AO „Baștina”, administrator, IDNO/IDNP: 1020620007396',
			ru: 'AO «Baștina», администратор, IDNO/IDNP: 1020620007396',
			en: 'AO "Baștina", administrator, IDNO/IDNP: 1020620007396'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY, MemberRolesEnum.SELECTION_COMMITTEE]
	},
	{
		name: { ro: 'Traci Pelaghia', ru: 'Трачи Пелагия', en: 'Traci Pelaghia' },
		shortDetails: {
			ro: 'AO „Plai Natal”, membru AO, IDNO/IDNP: 1017620004016',
			ru: 'AO «Plai Natal», член AO, IDNO/IDNP: 1017620004016',
			en: 'AO "Plai Natal", AO member, IDNO/IDNP: 1017620004016'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY, MemberRolesEnum.CENSORSHIP_COMMITTEE]
	},
	{
		name: { ro: 'Onu Maria', ru: 'Ону Мария', en: 'Onu Maria' },
		shortDetails: {
			ro: 'AO „Pro Ecaterinovca”, administrator, IDNO/IDNP: 1021620000877',
			ru: 'AO «Pro Ecaterinovca», администратор, IDNO/IDNP: 1021620000877',
			en: 'AO "Pro Ecaterinovca", administrator, IDNO/IDNP: 1021620000877'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY, MemberRolesEnum.SELECTION_COMMITTEE]
	},
	{
		name: { ro: 'Botea Inga', ru: 'Ботя Инга', en: 'Botea Inga' },
		shortDetails: {
			ro: 'AO „Renaștere”, contabil, IDNO/IDNP: 1020620008441',
			ru: 'AO «Renaștere», бухгалтер, IDNO/IDNP: 1020620008441',
			en: 'AO "Renaștere", accountant, IDNO/IDNP: 1020620008441'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY, MemberRolesEnum.SELECTION_COMMITTEE]
	},
	{
		name: { ro: 'Harati Lilia', ru: 'Харати Лилия', en: 'Harati Lilia' },
		shortDetails: {
			ro: 'AO „Struguraș”, membră AO, IDNO/IDNP: 1021620001427',
			ru: 'AO «Struguraș», член AO, IDNO/IDNP: 1021620001427',
			en: 'AO "Struguraș", AO member, IDNO/IDNP: 1021620001427'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY, MemberRolesEnum.ADMINISTRATION]
	},
	{
		name: { ro: 'Sturza Marina', ru: 'Стурза Марина', en: 'Sturza Marina' },
		shortDetails: {
			ro: 'AO „Speranța Viitorului”, administrator, IDNO/IDNP: 1021620004026',
			ru: 'AO «Speranța Viitorului», администратор, IDNO/IDNP: 1021620004026',
			en: 'AO "Speranța Viitorului", administrator, IDNO/IDNP: 1021620004026'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Său Anastasia', ru: 'Сэу Анастасия', en: 'Său Anastasia' },
		shortDetails: {
			ro: 'SRL „FIN-ART GRUP”, manager pe vânzări, IDNO/IDNP: 1024600015447',
			ru: 'SRL «FIN-ART GRUP», менеджер по продажам, IDNO/IDNP: 1024600015447',
			en: 'SRL "FIN-ART GRUP", sales manager, IDNO/IDNP: 1024600015447'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	},
	{
		name: { ro: 'Demian Georgeta', ru: 'Демиан Джорджета', en: 'Demian Georgeta' },
		shortDetails: {
			ro: 'SRL „Pogor Bio Brichete & Peleți”, administrator, IDNO/IDNP: 1025605006168',
			ru: 'SRL «Pogor Bio Brichete & Peleți», администратор, IDNO/IDNP: 1025605006168',
			en: 'SRL "Pogor Bio Brichete & Peleți", administrator, IDNO/IDNP: 1025605006168'
		},
		roles: [MemberRolesEnum.GENERAL_ASSEMBLY]
	}
]
