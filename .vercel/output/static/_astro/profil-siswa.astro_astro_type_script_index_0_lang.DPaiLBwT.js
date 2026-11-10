var e=[],t=[],n=[],r=null,i=``,a=null;async function o(){try{let[o,u,d,f]=await Promise.all([fetch(`/api/students`),fetch(`/api/attendance`),fetch(`/api/permissions`),fetch(`/api/schedules`)]);o.ok&&(e=await o.json()),u.ok&&(t=await u.json()),d.ok&&(n=await d.json());let p=[];f.ok&&(p=await f.json());let m=new URLSearchParams(window.location.search).get(`id`);i=localStorage.getItem(`auth_role`)||``;let h=localStorage.getItem(`auth_civitas`);a=null;try{h&&(a=JSON.parse(h))}catch{}i===`siswa`||i===`guru`?(a?.id&&(m=a.id),document.getElementById(`sidebar-back-to-menu`)?.classList.add(`hidden`),document.getElementById(`top-civitas-switcher-bar`)?.classList.add(`hidden`)):i===`admin`&&(document.getElementById(`sidebar-back-to-menu`)?.classList.remove(`hidden`),document.getElementById(`top-civitas-switcher-bar`)?.classList.remove(`hidden`)),m&&(r=e.find(e=>e.id===m||e.rfidUid===m)),!r&&a&&(r=a),!r&&e.length>0&&(r=e[0]),c(),l(),s(p)}catch(e){console.error(`Gagal memuat profil civitas:`,e)}}function s(e){let t=document.getElementById(`profil-agenda-list`),n=document.getElementById(`profil-agenda-count-badge`);if(!t)return;let a=i===`siswa`||r?.role===`siswa`||!i&&r?.type===`siswa`,o=document.getElementById(`btn-manage-agenda-link`);o&&(a?(o.classList.add(`hidden`),o.classList.remove(`inline-flex`)):(o.classList.remove(`hidden`),o.classList.add(`inline-flex`)));let s=new Date().toLocaleDateString(`en-CA`,{timeZone:`Asia/Jakarta`}),c=new Date(s+`T00:00:00`),l=e.filter(e=>{if(a){if(e.visibility===`guru`)return!1;let t=Number(e.notifyLeadDays??0);if(t>0){let n=e.startDate||e.date||``;if(n){let e=new Date(n+`T00:00:00`);if(Math.ceil((e.getTime()-c.getTime())/864e5)>t)return!1}}}return!0}),u=[],d=[];l.forEach(e=>{let t=e.endDate||e.startDate||e.date||``;t&&t<s?d.push(e):u.push(e)}),u.sort((e,t)=>{let n=e.startDate||e.date||``,r=t.startDate||t.date||``,i=n.localeCompare(r);return i===0?(e.timeStart||``).localeCompare(t.timeStart||``):i}),d.sort((e,t)=>{let n=e.endDate||e.startDate||e.date||``,r=(t.endDate||t.startDate||t.date||``).localeCompare(n);return r===0?(t.timeStart||``).localeCompare(e.timeStart||``):r});let f=u.length+d.length;if(n&&(n.textContent=u.length>0?`${u.length} Aktif`:`${f} Agenda`),f===0){t.innerHTML=`
          <div class="py-6 text-center text-slate-300 font-medium text-xs">
            <span class="material-symbols-outlined text-xl block mb-1 opacity-60">event_available</span>
            <span>Tidak ada agenda kegiatan terdekat</span>
          </div>
        `;return}let p=(e,t)=>{let n=`bg-teal-50 text-teal-800 border-teal-200/60`,r=`KBM`;e.category===`rapat`?(n=`bg-rose-50 text-rose-800 border-rose-200/60`,r=`Rapat`):e.category===`lsp`?(n=`bg-purple-50 text-purple-800 border-purple-200/60`,r=`UKK`):e.category===`khusus`&&(n=`bg-amber-50 text-amber-800 border-amber-200/60`,r=`Khusus`);let i=e.startDate&&e.endDate&&e.startDate!==e.endDate,o=i?`${e.startDate} s/d ${e.endDate}`:e.date||e.startDate||e.day,s=e.visibility===`guru`,l=``;if(t)l=`<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">Selesai</span>`;else{let t=e.startDate||e.date||``,n=e.endDate||t;if(t){let e=new Date(t+`T00:00:00`),r=new Date((n||t)+`T00:00:00`),a=Math.ceil((e.getTime()-c.getTime())/864e5),o=Math.ceil((r.getTime()-c.getTime())/864e5);a<=0&&o>=0?l=`<span class="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">${i?`Berlangsung`:`Hari Ini`}</span>`:a===1?l=`<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">Besok</span>`:a>1&&(l=`<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">H-${a}</span>`)}}let u=Number(e.notifyLeadDays??0),d=!a&&!s&&u>0?`<span class="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">H-${u} Siswa</span>`:``,f=t?`p-3.5 rounded-2xl bg-slate-50/50 border border-slate-200/60 opacity-75 hover:opacity-100 hover:bg-white hover:border-slate-300 transition-all space-y-1.5`:`p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-1.5`,p=t?`text-xs font-semibold text-slate-600 leading-snug`:`text-xs font-bold text-slate-900 leading-snug`;return`
          <div class="${f}">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <div class="flex items-center gap-1.5">
                <span class="text-[9px] font-bold px-2 py-0.5 rounded-md border ${n}">
                  ${r}
                </span>
                ${l}
                ${a?``:s?`<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200/60 flex items-center gap-0.5"><span class="material-symbols-outlined text-[10px]">lock</span>Khusus Guru</span>`:`<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200/60">Publik</span>`}
                ${d}
                ${i?`<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200/60">Multi Hari</span>`:``}
              </div>
              <span class="text-[11px] font-mono font-bold text-slate-500">
                ${e.timeStart} - ${e.timeEnd} WIB
              </span>
            </div>
            <h4 class="${p}">
              ${e.title}
            </h4>
            <div class="text-[11px] text-slate-500 flex items-center gap-2 pt-0.5">
              <span class="font-medium">📅 ${o}</span>
              <span class="text-slate-300">•</span>
              <span class="truncate">📍 ${e.room||`SMK`}</span>
              <span class="text-slate-300">•</span>
              <span class="font-bold text-slate-700 truncate">${e.classTarget||`Semua`}</span>
            </div>
          </div>
        `},m=u.map(e=>p(e,!1)).join(``);d.length>0&&(u.length>0&&(m+=`
            <div class="pt-2 pb-1 flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <div class="h-px bg-slate-200/70 flex-1"></div>
              <span>Agenda Selesai</span>
              <div class="h-px bg-slate-200/70 flex-1"></div>
            </div>
          `),m+=d.map(e=>p(e,!0)).join(``)),t.innerHTML=m}function c(){let t=document.getElementById(`top-civitas-switcher-bar`),n=document.getElementById(`civitas-switcher-container`);i===`siswa`||i===`guru`?t&&t.classList.add(`hidden`):i===`admin`?(t&&t.classList.remove(`hidden`),n&&(n.innerHTML=e.map(e=>{let t=r&&r.id===e.id,n=e.role===`guru`,i=e.role===`admin`,a=`bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium`;t&&(a=i?`bg-purple-600 text-white font-bold shadow-md shadow-purple-500/20`:n?`bg-amber-600 text-white font-bold shadow-md shadow-amber-500/20`:`bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20`);let o=i?`Admin`:n?`Guru`:e.className||`Siswa`;return`
          <button
            type="button"
            data-id="${e.id}"
            class="btn-switch-civitas px-3 py-1.5 rounded-xl text-xs transition duration-200 whitespace-nowrap cursor-pointer ${a}"
          >
            ${e.name.split(` `)[0]} (${o})
          </button>
        `}).join(``),n.querySelectorAll(`.btn-switch-civitas`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.dataset.id,i=e.find(e=>e.id===n);if(i){r=i;let e=new URL(window.location.href);e.searchParams.set(`id`,i.id),window.history.replaceState({},``,e.toString()),c(),l()}})}))):t&&t.classList.add(`hidden`)}function l(){if(!r)return;let e=r.role===`guru`,i=r.role===`admin`,a=e||i,s=r.className&&(r.className.toLowerCase().includes(`alumni`)||r.className.toLowerCase().includes(`lulus`))||r.category===`alumni`,c=localStorage.getItem(`auth_role`),l=c===`siswa`,f=c===`guru`||c===`admin`,p=document.getElementById(`sidebar-quick-actions`);p&&p.classList.toggle(`hidden`,l);let m=document.getElementById(`btn-wa-action`);m&&m.classList.toggle(`hidden`,l);let h=document.getElementById(`rapor-print-container`);h&&h.classList.toggle(`hidden`,l);let g=document.getElementById(`btn-open-modal-izin`);g&&g.classList.toggle(`hidden`,s);let _=document.getElementById(`btn-edit-current-profile`);_&&(_.classList.toggle(`hidden`,l),_.onclick=()=>{window.location.href=`/siswa-guru`});let v=document.getElementById(`btn-manage-agenda-link`);v&&(l||r?.role===`siswa`?(v.classList.add(`hidden`),v.classList.remove(`inline-flex`)):(v.classList.remove(`hidden`),v.classList.add(`inline-flex`)));let y=document.getElementById(`top-breadcrumb-title`);y&&(y.textContent=i?`Detail Profil Administrator & Manajemen Sekolah`:e?`Detail Profil Pendidik & Rekap Mengajar`:`Detail Profil Akademik Siswa`);let b=document.getElementById(`sidebar-avatar`),x=document.getElementById(`sidebar-name`),S=document.getElementById(`sidebar-role`),C=document.getElementById(`sidebar-wa-btn`),w=document.getElementById(`sidebar-wa-text`),T=document.getElementById(`sidebar-point-box`),ee=document.getElementById(`sidebar-point-badge`),te=a?`/assets/teacher_avatar_wahyu.jpg`:r.name.toLowerCase().includes(`alya`)?`/assets/student_avatar_alya.jpg`:`/assets/student_avatar_rizky.jpg`;b&&(b.src=te),x&&(x.textContent=r.name),S&&(S.textContent=i?`Administrator`:e?`Dewan Guru`:r.className||`Siswa`),T&&ee&&(a?T.classList.add(`hidden`):(T.classList.remove(`hidden`),ee.textContent=`100 Poin`)),C&&w&&(i?(w.textContent=`Hubungi Admin via WA`,C.href=`https://wa.me/6281234567890?text=Halo%20Admin%20${encodeURIComponent(r.name)}`):e?(w.textContent=`Hubungi Guru via WA`,C.href=`https://wa.me/6281369014432?text=Halo%20Bapak%2FIbu%20${encodeURIComponent(r.name)}`):(w.textContent=`Hubungi Wali via WA`,C.href=`https://wa.me/6282177889900?text=Halo%20Wali%20Murid%20dari%20${encodeURIComponent(r.name)}`));let ne=document.getElementById(`profile-avatar`),re=document.getElementById(`profile-name`),ie=document.getElementById(`profile-headline`),ae=document.getElementById(`profile-id-label`),oe=document.getElementById(`profile-nisn`),se=document.getElementById(`profile-reg-label`),E=document.getElementById(`profile-regdate`),ce=document.getElementById(`profile-birth`),D=document.getElementById(`profile-email`),le=document.getElementById(`profile-phone-label`),O=document.getElementById(`profile-phone`),k=document.getElementById(`btn-wa-action`),A=document.getElementById(`btn-wa-text`),j=document.getElementById(`badge-role-tag`),M=document.getElementById(`badge-role-text`),N=document.getElementById(`badge-verif-tag`),P=document.getElementById(`badge-verif-text`);ne&&(ne.src=te),re&&(re.textContent=r.name),ie&&(ie.textContent=i?`${r.className||`Administrator Sekolah`} • SMK Ma'arif 1 Padang Ratu`:e?`${r.className||`Dewan Guru`} • SMK Ma'arif 1 Padang Ratu`:`${r.className||`Kelas Siswa`} • SMK Ma'arif 1 Padang Ratu`);let ue=document.getElementById(`profile-custom-id`),de=document.getElementById(`profile-nisn-label`),fe=document.getElementById(`profile-city-label`),pe=document.getElementById(`profile-city`),me=document.getElementById(`profile-detail-name`),F=(r.rfidUid||``).trim().toUpperCase(),I=i?`Tersimpan di Database`:F.length===9?F.match(/.{1,3}/g)?.join(` `):F.match(/.{1,4}/g)?.join(` `)||F||`-`;me&&(me.textContent=r.name),ae&&(ae.textContent=`ID RFID:`),ue&&(ue.textContent=I),de&&(de.textContent=i?`NIP / ID Admin:`:e?`NIP / NUPTK:`:`NISN:`),oe&&(oe.textContent=r.identifier||(i?`199001012023011001`:e?`198403152009021003`:`0068472911`)),fe&&(fe.textContent=`Alamat:`),pe&&(pe.textContent=r.address||`Padang Ratu, Lampung`);let he=!f;if([`row-profile-regdate`,`row-profile-birth`,`row-profile-email`,`row-profile-phone`].forEach(e=>{let t=document.getElementById(e);t&&t.classList.toggle(`hidden`,he)}),se&&(se.textContent=i?`TMT Admin:`:e?`TMT Tugas:`:`Tgl Daftar:`),E&&(E.textContent=i?`1 Januari 2020`:e?`1 September 2018`:`15 Juli 2024`),ce&&(ce.textContent=r.birthDate||(i?`10 Januari 1990`:e?`15 Maret 1984`:`12 Mei 2007`)),D){let e=r.email||`${r.name.toLowerCase().replace(/[^a-z0-9]/g,`.`)}@smkmaarif.sch.id`;D.textContent=e,D.title=e}if(le&&(le.textContent=i?`Kontak Admin:`:e?`Kontak Pendidik:`:`No. Wali / Kontak:`),O&&(O.textContent=r.phone||(i?`+62 812-3456-7890`:e?`+62 813-6901-4432`:`+62 821-7788-9900`)),k&&A){if(f){k.classList.remove(`hidden`);let t=(r.phone||(i?`6281234567890`:e?`6281369014432`:`6282177889900`)).replace(/[^0-9]/g,``);i?(A.textContent=`Hubungi Admin via WhatsApp`,k.href=`https://wa.me/${t}?text=Halo%20Admin%20${encodeURIComponent(r.name)}`):e?(A.textContent=`Hubungi Guru via WhatsApp`,k.href=`https://wa.me/${t}?text=Halo%20Bapak%2FIbu%20${encodeURIComponent(r.name)}`):(A.textContent=`Hubungi Wali Murid via WhatsApp`,k.href=`https://wa.me/${t}?text=Halo%20Wali%20Murid%20dari%20${encodeURIComponent(r.name)}`)}else k.classList.add(`hidden`)}j&&M&&(i?(j.className=`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-800 font-bold text-[11px] border border-purple-200/80`,M.textContent=`Administrator`):e?(j.className=`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200/80`,M.textContent=`Guru Kejuruan`):(j.className=s?`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200`:`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200/60`,M.textContent=s?`Alumni Sekolah`:`Siswa Reguler`)),N&&P&&(i?(N.className=`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200/80`,P.textContent=`Admin Terverifikasi`):e?(N.className=`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200/80`,P.textContent=`NUPTK Terverifikasi`):(N.className=s?`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200`:`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-200/60`,P.textContent=s?`Alumni Terverifikasi`:`Terverifikasi Rombel`));let ge=document.getElementById(`bio-card-status`),_e=document.getElementById(`bio-class-status`),L=document.getElementById(`bio-presensi-status`);ge&&(ge.textContent=I),_e&&(_e.textContent=r.className||(i?`Administrator`:e?`Dewan Guru`:`Siswa`));let ve=document.getElementById(`card-uid-display`),ye=document.getElementById(`card-mockup-uid`),be=document.getElementById(`card-mockup-name`),xe=document.getElementById(`card-mockup-type`),Se=document.getElementById(`card-mockup-role-badge`),Ce=document.getElementById(`btn-simulate-tap-card`),we=document.getElementById(`btn-simulate-tap-label`);ve&&(ve.textContent=I),ye&&(ye.textContent=i?`Admin Key (Database Only)`:`${I} (RFID)`),be&&(be.textContent=r.name),xe&&(xe.textContent=i?`KARTU AKSES ADMINISTRATOR`:e?`KARTU AKSES DEWAN GURU`:`KARTU AKSES CERDAS SISWA`),Se&&(Se.textContent=i?`ADMIN 13.56 MHz`:e?`GURU 13.56 MHz`:`RFID 13.56 MHz`),we&&(we.textContent=`Simulasi Tap Gerbang (${r.name.split(` `)[0]})`),Ce&&(Ce.onclick=()=>{window.tap?window.tap(F):alert(`Simulasi tap berhasil untuk UID ${F} (${r.name})`)});let R=t.filter(e=>e.rfidUid&&r.rfidUid&&e.rfidUid.toUpperCase()===r.rfidUid.toUpperCase()||e.name===r.name),z=n.filter(e=>e.studentId===r.id||e.name&&r.name&&e.name.toLowerCase()===r.name.toLowerCase()),Te=new Date().toLocaleDateString(`en-CA`,{timeZone:`Asia/Jakarta`}),B=z.find(e=>e.status===`Disetujui`&&Te>=e.startDate&&Te<=(e.endDate||e.startDate));if(L){if(B)L.textContent=`Izin (${B.categoryLabel||`Izin`})`,L.className=`text-xs font-black text-purple-700`;else if(R.length>0){let e=R[R.length-1];e.status===`Bolos`?(L.textContent=`Bolos (-10 Poin)`,L.className=`text-xs font-black text-rose-600 animate-pulse`):e.status===`Hadir`?(L.textContent=`Hadir Tepat Waktu`,L.className=`text-xs font-black text-emerald-600`):(L.textContent=e.status,L.className=`text-xs font-black text-amber-600`)}else(typeof window.isSchoolHoliday==`function`?window.isSchoolHoliday():new Date().getDay()===0)?(L.textContent=`Libur Sekolah (Minggu)`,L.className=`text-xs font-black text-indigo-600`):(L.textContent=s?`Alumni (Lulus)`:`Belum Hadir`,L.className=`text-xs font-black text-slate-500`)}let Ee=document.getElementById(`timeline-title-text`),De=document.getElementById(`timeline-card-desc`),Oe=document.getElementById(`timeline-item1-title`),V=document.getElementById(`timeline-presensi-badge`),H=document.getElementById(`timeline-presensi-desc`),U=document.getElementById(`timeline-presensi-id`),W=document.getElementById(`timeline-item2-title`),G=document.getElementById(`timeline-izin-badge`),K=document.getElementById(`timeline-izin-desc`),q=document.getElementById(`timeline-item2-sub`);if(Ee&&(Ee.textContent=e?`History Aktivitas & Catatan Pendidik`:`History Aktivitas & Catatan Siswa`),De&&(De.textContent=e?`Jejak presensi gerbang, verifikasi perizinan, dan riwayat kedatangan.`:`Jejak presensi gerbang, verifikasi perizinan, dan riwayat presensi kartu.`),Oe&&(Oe.textContent=e?`Presensi Pendidik Hari Ini`:`Presensi Gerbang Hari Ini`),B)V&&(V.textContent=`Izin (${B.categoryLabel||`Sah`})`,V.className=`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white`),H&&(H.textContent=`Status Presensi Hari Ini: Izin Resmi (${B.categoryLabel||`Izin`}) • Alasan: "${B.title}". Terkunci seharian sebagai izin sah.`),U&&(U.textContent=B.id);else if(R.length>0){let e=R[R.length-1];V&&(V.textContent=e.status||`Hadir`,V.className=e.status===`Bolos`?`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse`:e.status===`Hadir`?`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white`:`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white`),H&&(H.textContent=e.status===`Bolos`?`Tercatat presensi masuk pagi namun TIDAK melakukan presensi kepulangan (Bolos • Poin berkurang -10).`:`Tap ${e.type||`masuk`} pada pukul ${e.time} WIB • Status: ${e.status} (Gerbang Utama)`),U&&(U.textContent=e.id)}else{let t=typeof window.isSchoolHoliday==`function`?window.isSchoolHoliday():new Date().getDay()===0;V&&(V.textContent=t?`Libur Sekolah`:`Belum Hadir`,V.className=t?`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white`:`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-400 text-white`),H&&(H.textContent=t?`Hari ini adalah hari Minggu (Libur Sekolah Akhir Pekan). Siswa dan guru tidak ada jadwal KBM.`:e?`Belum ada pemindaian kartu RFID guru pada hari ini.`:`Belum ada pemindaian kartu RFID siswa pada hari ini.`),U&&(U.textContent=t?`LIBUR-AKHIR-PEKAN`:`MENUNGGU-SCAN`)}if(e){W&&(W.textContent=`Status Kehadiran & Tugas Pendidik`),G&&(G.textContent=`Aktif Bertugas`,G.className=`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white`),K&&(K.textContent=`Guru aktif bertugas mengajar KBM dan bimbingan kejuruan di sekolah.`),q&&(q.textContent=`Status kedisiplinan guru dipantau melalui Rapor Kinerja Pendidik.`);let e=document.getElementById(`timeline-izin-actions-box`);e&&(e.innerHTML=`<span class="text-[11px] text-slate-500">Presensi pendidik berlaku 1 kali per hari kerja.</span>`)}else{W&&(W.textContent=`Status Perizinan & Pengajuan Izin`);let e=document.getElementById(`timeline-izin-actions-box`);if(z.length>0){let t=z[0],n=t.status||`Menunggu`;G&&(n===`Disetujui`?(G.textContent=`Disetujui (Aktif)`,G.className=`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white`):n===`Selesai`?(G.textContent=`Selesai (Diarsipkan)`,G.className=`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-600 text-white`):n===`Ditolak`?(G.textContent=`Ditolak`,G.className=`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white`):(G.textContent=`Menunggu Persetujuan`,G.className=`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white animate-pulse`)),K&&(K.textContent=`${t.title||`Izin`} • ${t.categoryLabel||`Keterangan`} (${t.daysCount||1} Hari: ${t.startDate} s/d ${t.endDate})`),q&&(q.textContent=`Lampiran: ${t.attachmentNote||`Surat Resmi Sekolah`}`),e&&(e.innerHTML=`
              <div class="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                <span>Status Verifikasi Sekolah:</span>
                <span class="font-bold px-2 py-0.5 rounded-md ${n===`Disetujui`?`bg-emerald-100 text-emerald-800`:n===`Selesai`?`bg-slate-100 text-slate-800`:n===`Ditolak`?`bg-rose-100 text-rose-800`:`bg-amber-100 text-amber-800`}">
                  ${n===`Disetujui`?`✓ Diterima (Disetujui)`:n===`Selesai`?`✓ Izin Telah Selesai & Diarsipkan`:n===`Ditolak`?`✗ Tidak Diterima / Ditolak`:`⏳ Menunggu Persetujuan Guru`}
                </span>
              </div>
              <div class="flex items-center gap-1">
                ${n===`Disetujui`?`
                  <button
                    type="button"
                    class="btn-toggle-perm-status px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-[10px] font-bold cursor-pointer transition"
                    data-id="${t.id}"
                    data-status="Selesai"
                    title="Akhiri masa izin dan arsipkan ke riwayat"
                  >
                    ⏹ Selesaikan Izin
                  </button>
                `:`
                  <button
                    type="button"
                    class="btn-toggle-perm-status px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold cursor-pointer transition"
                    data-id="${t.id}"
                    data-status="Disetujui"
                  >
                    ✓ Terima Izin
                  </button>
                `}
                <button
                  type="button"
                  class="btn-toggle-perm-status px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold cursor-pointer transition"
                  data-id="${t.id}"
                  data-status="Ditolak"
                >
                  ✗ Tolak Izin
                </button>
              </div>
            `,e.querySelectorAll(`.btn-toggle-perm-status`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.id,n=e.dataset.status;try{(await fetch(`/api/permissions`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({action:`update_status`,id:t,status:n})})).ok&&await o()}catch(e){console.error(`Gagal update status izin:`,e)}})}))}else G&&(G.textContent=`Nihil Izin`,G.className=`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-300 text-slate-700`),K&&(K.textContent=`Tidak ada catatan izin aktif. Siswa aktif hadir di kelas.`),q&&(q.textContent=`Klik tombol "+ Ajukan Izin" di atas jika berhalangan hadir.`),e&&(e.innerHTML=`
              <span class="text-[11px] text-slate-500">Belum ada pengajuan izin minggu ini.</span>
            `)}let ke=document.getElementById(`timeline-history-title`),J=document.getElementById(`timeline-history-badge`),Ae=document.getElementById(`timeline-history-list`);ke&&(ke.textContent=e?`Riwayat Presensi Mengajar & Kehadiran Pendidik`:`Riwayat Jejak Presensi Gerbang (${r.name.split(` `)[0]})`),J&&(J.textContent=R.length>0?`${R.length} Log Presensi`:`Nihil Presensi`,J.className=R.length>0?`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200`:`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-700`),Ae&&(Ae.innerHTML=R.length===0?`
            <div class="p-3.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-600 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-lg">event_busy</span>
              </div>
              <div>
                <p class="font-bold text-slate-800">Belum Ada Riwayat Presensi</p>
                <p class="text-[11px] text-slate-500">Siswa ini belum memiliki log pemindaian kartu RFID. Data riwayat presensi masuk dan keterlambatan hanya akan tercatat di akun siswa ini saat kartu di-tap.</p>
              </div>
            </div>
          `:[...R].reverse().map((e,t)=>{let n=e.status===`Bolos`,r=e.status===`Terlambat`,i=e.type===`masuk`,a=`border-slate-200`;n?a=`border-rose-300 bg-rose-50/40`:r&&(a=`border-amber-300 bg-amber-50/30`);let o=``;return o=n?`<span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">🚫 Bolos (-10 Poin)</span>`:r?`<span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">⚠️ Terlambat</span>`:`<span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">✓ Hadir Tepat Waktu</span>`,`
              <div class="p-3 rounded-xl bg-white border ${a} flex items-center justify-between gap-3 text-xs flex-wrap">
                <div class="flex items-center gap-2.5">
                  <span class="w-6 h-6 rounded-lg ${n?`bg-rose-100 text-rose-800`:r?`bg-amber-100 text-amber-800`:`bg-emerald-100 text-emerald-800`} text-[11px] font-black flex items-center justify-center">
                    #${R.length-t}
                  </span>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-slate-800">${e.date}</span>
                      <span class="font-mono text-slate-500 text-[11px] font-semibold">${e.time} WIB</span>
                    </div>
                    <p class="text-[11px] text-slate-500">
                      Sesi: <span class="font-semibold text-slate-700 uppercase">${i?`Presensi Masuk (Pagi)`:`Presensi Pulang`}</span> • ID: <span class="font-mono text-slate-400">${e.id}</span>
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-1.5">
                  ${o}
                </div>
              </div>
            `}).join(``)),u();let Y=document.getElementById(`rapor-category-tag`),X=document.getElementById(`rapor-title`),Z=document.getElementById(`rapor-subtitle`),Q=document.getElementById(`rapor-stats-container`),$=document.getElementById(`rapor-action-text`);if(e){Y&&(Y.textContent=`Rapor Kinerja & Presensi Guru`),X&&(X.textContent=`Indikator Kinerja Pendidik Profesional`),Z&&(Z.textContent=`Catatan kehadiran dan kedisiplinan mengajar semester berjalan.`),$&&($.textContent=`Cetak Rapor Kinerja & Kartu Pendidik`);let e=R.length,t=R.filter(e=>e.status===`Hadir`).length,n=R.filter(e=>e.status===`Terlambat`).length,r=e>0?Math.round(t/e*100):100;Q&&(Q.innerHTML=`
            <div class="p-4 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
              <div>
                <p class="text-[11px] text-blue-200">Rasio Kehadiran Mengajar</p>
                <p class="text-sm font-black text-white">${r}% (${r===100?`Sangat Baik`:`Cukup`})</p>
              </div>
            </div>
            <div class="p-4 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
              <div>
                <p class="text-[11px] text-blue-200">Presensi Tepat Waktu</p>
                <p class="text-sm font-black text-white">${t} Hari</p>
              </div>
            </div>
            <div class="p-4 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-300 shrink-0"></span>
              <div>
                <p class="text-[11px] text-blue-200">Keterlambatan</p>
                <p class="text-sm font-black text-white">${n} Hari</p>
              </div>
            </div>
            <div class="p-4 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-purple-300 shrink-0"></span>
              <div>
                <p class="text-[11px] text-blue-200">Surat Tugas / Perizinan</p>
                <p class="text-sm font-black text-white">${z.length} Berkas</p>
              </div>
            </div>
          `)}else{Y&&(Y.textContent=`Rapor Kehadiran & Prestasi`),X&&(X.textContent=`Indikator Portofolio Siswa Berprestasi`),Z&&(Z.textContent=`Catatan kedisiplinan semester berjalan di SMK Ma'arif 1 Padang Ratu.`),$&&($.textContent=`Cetak Rapor & Kartu Siswa`);let e=R.length,t=R.filter(e=>e.status===`Hadir`).length,n=R.filter(e=>e.status===`Terlambat`).length,r=e>0?Math.round(t/e*100):100;Q&&(Q.innerHTML=`
            <div class="p-4 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
              <div>
                <p class="text-[11px] text-blue-200">Rasio Kehadiran</p>
                <p class="text-sm font-black text-white">${r}% (${r===100?`Sangat Baik`:`Perlu Evaluasi`})</p>
              </div>
            </div>
            <div class="p-4 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
              <div>
                <p class="text-[11px] text-blue-200">Hadir Tepat Waktu</p>
                <p class="text-sm font-black text-white">${t} Hari</p>
              </div>
            </div>
            <div class="p-4 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-300 shrink-0"></span>
              <div>
                <p class="text-[11px] text-blue-200">Keterlambatan</p>
                <p class="text-sm font-black text-white">${n} Hari</p>
              </div>
            </div>
            <div class="p-4 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-purple-300 shrink-0"></span>
              <div>
                <p class="text-[11px] text-blue-200">Izin Sah / Dispensasi</p>
                <p class="text-sm font-black text-white">${z.length} Berkas</p>
              </div>
            </div>
          `)}d(e,z)}async function u(){if(!r)return;let e=r.role===`guru`,t=r.role===`admin`,n=e||t,i=document.getElementById(`poin-student-view`),a=document.getElementById(`poin-guru-view`),o=document.getElementById(`sidebar-point-box`),s=document.getElementById(`sidebar-point-badge`),c=document.getElementById(`poin-display-val`),l=document.getElementById(`poin-circle-container`),u=document.getElementById(`poin-status-pill`),d=document.getElementById(`poin-history-count`),f=document.getElementById(`poin-history-container`);if(n)o&&o.classList.add(`hidden`),i&&i.classList.add(`hidden`),a&&a.classList.remove(`hidden`);else{o&&o.classList.remove(`hidden`),i&&i.classList.remove(`hidden`),a&&a.classList.add(`hidden`);try{let t=await(await fetch(`/api/points?studentId=${r.id}&rfid=${r.rfidUid}`)).json(),n=Number(t.totalPoints??100),i=t.deductions||[];s&&(s.textContent=`${n} Poin`,s.className=n>=50?`px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-black font-mono text-[11px]`:n>=10?`px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 font-black font-mono text-[11px]`:`px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-400/30 font-black font-mono text-[11px] animate-pulse`),c&&(c.textContent=String(n)),l&&(n>=50?(l.className=`w-32 h-32 rounded-full border-8 border-emerald-500/30 flex flex-col items-center justify-center bg-emerald-50/50 relative transition-all`,c&&(c.className=`text-4xl font-black text-emerald-600 font-mono`)):n>=10?(l.className=`w-32 h-32 rounded-full border-8 border-amber-500/30 flex flex-col items-center justify-center bg-amber-50/50 relative transition-all`,c&&(c.className=`text-4xl font-black text-amber-600 font-mono`)):(l.className=`w-32 h-32 rounded-full border-8 border-rose-500/30 flex flex-col items-center justify-center bg-rose-50/50 relative transition-all`,c&&(c.className=`text-4xl font-black text-rose-600 font-mono animate-pulse`))),u&&(n===100?(u.className=`mt-4 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300`,u.textContent=`Status: Disiplin & Aman (100 Poin)`):n>=50?(u.className=`mt-4 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300`,u.textContent=`Status: Aktif (${n} Poin)`):n>=10?(u.className=`mt-4 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300`,u.textContent=`Peringatan: Perlu Pembinaan (${n} Poin)`):n>0?(u.className=`mt-4 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse`,u.textContent=`Peringatan Kritis! (${n} Poin) - Temui Guru`):(u.className=`mt-4 px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white border border-rose-700 shadow-md animate-bounce`,u.textContent=`Akses Terkunci! Wajib Reset Wakasis`)),d&&(d.textContent=i.length>0?`${i.length} Kali Pengurangan Poin`:`0 Pelanggaran (Bersih)`),f&&(f.innerHTML=i.length===0?`
              <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <span class="material-symbols-outlined text-lg">verified</span>
                </div>
                <div class="text-xs space-y-0.5">
                  <p class="font-bold text-emerald-900">Catatan Poin Bersih (100 Poin Utuh)</p>
                  <p class="text-emerald-700 text-[11px] leading-relaxed">
                    Siswa ini senantiasa hadir tepat waktu dan belum memiliki catatan pengurangan poin keterlambatan pada presensi pagi gerbang.
                  </p>
                </div>
              </div>
            `:i.map((e,t)=>{let n=e.date;try{let t=e.date.split(`-`);t.length===3&&(n=new Date(Number(t[0]),Number(t[1])-1,Number(t[2])).toLocaleDateString(`id-ID`,{weekday:`long`,year:`numeric`,month:`short`,day:`numeric`}))}catch{}return`
                <div class="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-xs transition-all space-y-2.5">
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 text-xs font-black flex items-center justify-center">
                        #${i.length-t}
                      </span>
                      <span class="text-xs font-bold text-slate-800">${n}</span>
                      <span class="text-[11px] font-mono text-slate-500 font-semibold">• ${e.time} WIB</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${e.minutesLate>0?`bg-amber-50 text-amber-800 border border-amber-200`:`bg-rose-50 text-rose-800 border border-rose-200`}">
                        ${e.minutesLate>0?`Telat ${e.minutesLate} Menit`:`Bolos Kepulangan`}
                      </span>
                      <span class="px-2.5 py-0.5 rounded-md text-xs font-black bg-rose-100 text-rose-700 border border-rose-200">
                        -${e.pointsDeducted} Poin
                      </span>
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                        Sisa ${e.remainingPoints??`-`} Poin
                      </span>
                    </div>
                  </div>

                  <!-- Alasan / Keterangan Sebab Poin Berkurang -->
                  <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 flex items-start gap-2">
                    <span class="material-symbols-outlined text-rose-500 text-base shrink-0 mt-0.5">report_problem</span>
                    <div class="min-w-0">
                      <span class="font-bold text-slate-900 block text-[11px] uppercase tracking-wide">Keterangan Sebab Pengurangan:</span>
                      <p class="text-xs text-slate-700 leading-relaxed">${e.reason}</p>
                    </div>
                  </div>
                </div>
              `}).join(``));let a=document.getElementById(`timeline-item-poin-node`),o=document.getElementById(`timeline-poin-card`),p=document.getElementById(`timeline-poin-dot`),m=document.getElementById(`timeline-poin-dot-inner`),h=document.getElementById(`timeline-poin-badge`),g=document.getElementById(`timeline-poin-remaining`),_=document.getElementById(`timeline-poin-detail-box`);if(a){if(e)a.classList.add(`hidden`);else if(a.classList.remove(`hidden`),g&&(g.textContent=`Sisa ${n} / 100 Poin`),i.length===0)p&&(p.className=`absolute -left-6 sm:-left-8 top-5 w-5 h-5 rounded-full bg-white border-3 border-emerald-500 shadow-md group-hover:scale-125 transition-transform duration-200 -translate-x-1/2 flex items-center justify-center`),m&&(m.className=`w-1.5 h-1.5 rounded-full bg-emerald-500`),o&&(o.className=`p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 hover:bg-emerald-50 hover:shadow-md transition-all duration-200 space-y-3`),h&&(h.textContent=`100 Poin Utuh (Disiplin)`,h.className=`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white`),_&&(_.innerHTML=`
                  <div class="p-3.5 rounded-xl bg-white border border-emerald-200/80 shadow-xs flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined text-lg">verified</span>
                    </div>
                    <div class="text-xs">
                      <p class="font-bold text-emerald-900">Catatan Poin Bersih (100 Poin Utuh)</p>
                      <p class="text-emerald-700 text-[11px]">Siswa selalu hadir tepat waktu pada gerbang pagi. Akumulasi poin saat ini utuh 100 poin tanpa catatan pelanggaran.</p>
                    </div>
                  </div>
                `);else{let e=i[0];p&&(p.className=`absolute -left-6 sm:-left-8 top-5 w-5 h-5 rounded-full bg-white border-3 border-rose-500 shadow-md group-hover:scale-125 transition-transform duration-200 -translate-x-1/2 flex items-center justify-center`),m&&(m.className=`w-1.5 h-1.5 rounded-full bg-rose-500`),o&&(o.className=`p-4 sm:p-5 rounded-2xl bg-rose-50/60 border border-rose-200/70 hover:bg-rose-50 hover:shadow-md transition-all duration-200 space-y-3`),h&&(h.textContent=`-${e.pointsDeducted} Poin (Telat ${e.minutesLate} Mnt)`,h.className=`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white`);let t=``;n===0?t=`
                  <div class="p-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-2 shadow-xs">
                    <span class="material-symbols-outlined text-sm">block</span>
                    <span>Akses Ditolak: Poin siswa 0 (Terkunci). Silahkan temui Guru Piket atau Wakasis untuk reset poin!</span>
                  </div>
                `:n<10&&(t=`
                  <div class="p-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-xs animate-pulse">
                    <span class="material-symbols-outlined text-sm">warning</span>
                    <span>Peringatan LCD: Anda berhasil absen namun poin Anda kurang dari 10. Silahkan temui guru terlebih dahulu!</span>
                  </div>
                `),_&&(_.innerHTML=`
                  ${t}
                  ${i.map(e=>{let t=e.date;try{let n=e.date.split(`-`);n.length===3&&(t=new Date(Number(n[0]),Number(n[1])-1,Number(n[2])).toLocaleDateString(`id-ID`,{weekday:`long`,year:`numeric`,month:`short`,day:`numeric`}))}catch{}return`
                      <div class="p-3.5 rounded-xl bg-white border border-rose-200 shadow-xs space-y-2">
                        <div class="flex items-center justify-between gap-2 flex-wrap text-xs">
                          <div class="flex items-center gap-2">
                            <span class="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-black text-xs">
                              -${e.pointsDeducted} Poin
                            </span>
                            <span class="font-bold text-slate-800">${t}</span>
                            <span class="text-slate-500 font-mono text-[11px]">• ${e.time} WIB</span>
                          </div>
                          <div class="flex items-center gap-1.5">
                            <span class="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px]">
                              Telat ${e.minutesLate} Menit
                            </span>
                            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px] font-mono">
                              Sisa ${e.remainingPoints??`-`} Poin
                            </span>
                          </div>
                        </div>

                        <!-- Sebab Pengurangan Poin Sesuai ide.txt -->
                        <div class="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/60 text-xs text-slate-700 flex items-start gap-2">
                          <span class="material-symbols-outlined text-rose-500 text-base shrink-0 mt-0.5">report_problem</span>
                          <div class="min-w-0">
                            <span class="font-bold text-slate-900 block text-[11px] uppercase tracking-wide">Keterangan Sebab Pengurangan:</span>
                            <p class="text-xs text-slate-800 leading-relaxed font-medium">${e.reason}</p>
                          </div>
                        </div>
                      </div>
                    `}).join(``)}
                `)}}}catch(e){console.error(`Gagal memuat rangkuman poin:`,e)}}}function d(e,t){if(!r)return;let n=e||i===`guru`,a=document.getElementById(`sidebar-izin-icon`),s=document.getElementById(`sidebar-izin-title`),c=document.getElementById(`sidebar-izin-badge`);s&&a&&c&&(n?(a.textContent=`verified_user`,s.textContent=`Konfirmasi Izin Siswa`,c.textContent=`Guru`,c.className=`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-900`):(a.textContent=`edit_document`,s.textContent=`Pengajuan Izin`,c.textContent=`Izin`,c.className=`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-white/20 text-blue-100`));let l=document.getElementById(`panel-guru-konfirmasi-izin`),u=document.getElementById(`panel-form-izin-mandiri`),d=document.getElementById(`panel-my-permissions`);n?(l&&l.classList.remove(`hidden`),u&&u.classList.add(`hidden`),d&&d.classList.add(`hidden`),m()):(l&&l.classList.add(`hidden`),u&&u.classList.remove(`hidden`),d&&d.classList.remove(`hidden`));let f=document.getElementById(`form-izin-name`),p=document.getElementById(`form-izin-class`),h=document.getElementById(`form-izin-jurusan-box`),g=document.getElementById(`form-izin-photo-box`),_=document.getElementById(`izin-form-header-title`),v=document.getElementById(`form-izin-start-date`),b=document.getElementById(`form-izin-end-date`),x=document.getElementById(`form-izin-days-text`);if(f&&(f.value=r.name),p&&(p.value=r.className||(e?`Dewan Guru`:`XII`)),_&&(_.textContent=e?`Formulir Pengajuan Izin Pendidik`:`Formulir Pengajuan Izin Siswa`),e)h&&h.classList.add(`hidden`),g&&g.classList.add(`hidden`);else{h&&h.classList.remove(`hidden`),g&&g.classList.remove(`hidden`);let e=document.getElementById(`cb-jurusan-rpl`),t=document.getElementById(`cb-jurusan-akl`),n=(r.category||r.className||``).toLowerCase();e&&t&&!e.checked&&!t.checked&&(n.includes(`rpl`)?e.checked=!0:n.includes(`akl`)&&(t.checked=!0))}let S=new Date().toLocaleDateString(`en-CA`,{timeZone:`Asia/Jakarta`});v&&!v.value&&(v.value=S),b&&!b.value&&(b.value=S),x&&!x.textContent&&(x.textContent=`1 Hari`);let C=document.getElementById(`my-permissions-container`);C&&(t.length===0?C.innerHTML=`
            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-500">
              <span class="material-symbols-outlined text-3xl text-slate-400 block mb-1">note_alt</span>
              Belum ada riwayat permohonan izin yang diajukan. Silahkan isi formulir di atas untuk mengajukan izin baru.
            </div>
          `:(C.innerHTML=t.map(e=>{let t=(e.status||`Menunggu`)===`Menunggu`,n=e.status===`Disetujui`,r=e.status===`Ditolak`,i=`bg-amber-100 text-amber-800 border-amber-300 animate-pulse`,a=`⏳ Menunggu Persetujuan`;return n?(i=`bg-emerald-100 text-emerald-800 border-emerald-300`,a=`✓ Disetujui`):r&&(i=`bg-rose-100 text-rose-800 border-rose-300`,a=`✗ Ditolak`),`
              <div class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-xs transition-all space-y-3" id="perm-card-${e.id}">
                <div class="flex items-start justify-between gap-3 flex-wrap">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-mono text-[11px] font-bold text-slate-400">${e.id}</span>
                      <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-black border ${i}">
                        ${a}
                      </span>
                      ${e.approvedBy?`
                        <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${n?`bg-emerald-50 text-emerald-800 border border-emerald-200`:`bg-rose-50 text-rose-800 border border-rose-200`} flex items-center gap-1">
                          <span class="material-symbols-outlined text-[13px]">${n?`verified`:`cancel`}</span>
                          <span>${n?`Disetujui oleh:`:`Ditolak oleh:`} <strong>${e.approvedBy}</strong></span>
                        </span>
                      `:``}
                      ${e.jurusan?`<span class="px-2 py-0.5 rounded-lg text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 uppercase">Jurusan: ${e.jurusan}</span>`:``}
                    </div>
                    <h4 class="text-xs font-black text-slate-900">${e.title||`Alasan Permohonan Izin`}</h4>
                    <p class="text-[11px] text-slate-500">
                      Kategori: <strong class="text-slate-700">${e.categoryLabel||e.category||`Izin`}</strong> • Rentang: <strong>${e.startDate}</strong> s/d <strong>${e.endDate||e.startDate}</strong> (${e.daysCount||1} Hari)
                    </p>
                  </div>

                  <!-- Aksi: Edit & Batalkan/Hapus khusus status Menunggu -->
                  <div class="flex items-center gap-1.5 shrink-0">
                    ${t?`
                      <button
                        type="button"
                        class="btn-edit-my-perm px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        data-id="${e.id}"
                      >
                        <span class="material-symbols-outlined text-sm">edit</span>
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        class="btn-delete-my-perm px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        data-id="${e.id}"
                      >
                        <span class="material-symbols-outlined text-sm">delete</span>
                        <span>Batalkan / Hapus</span>
                      </button>
                    `:`
                      <span class="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                        🔒 Status Terkunci
                      </span>
                    `}
                  </div>
                </div>

                <!-- Info Verifikator Guru Resmi -->
                ${e.approvedBy?`
                  <div class="p-2.5 rounded-xl ${n?`bg-emerald-50/70 border border-emerald-200/80 text-emerald-900`:`bg-rose-50/70 border border-rose-200/80 text-rose-900`} text-xs font-semibold flex items-center justify-between gap-2 flex-wrap">
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-sm ${n?`text-emerald-600`:`text-rose-600`}">${n?`verified`:`cancel`}</span>
                      <span>${n?`Permohonan ini telah disetujui oleh:`:`Permohonan ditolak oleh:`} <strong class="font-black text-slate-900 underline decoration-slate-300 underline-offset-2">${e.approvedBy}</strong></span>
                    </div>
                    ${e.approvedAt?`<span class="text-[10px] font-normal text-slate-500">${new Date(e.approvedAt).toLocaleDateString(`id-ID`,{day:`numeric`,month:`short`,year:`numeric`,hour:`2-digit`,minute:`2-digit`})} WIB</span>`:``}
                  </div>
                `:t?`
                  <div class="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-900 text-xs font-medium flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-amber-600">hourglass_top</span>
                    <span>Menunggu peninjauan dan persetujuan dari dewan guru / wali kelas.</span>
                  </div>
                `:``}

                ${e.photoProof?`
                  <div class="pt-2 border-t border-slate-100 flex items-center gap-3">
                    <a href="${e.photoProof}" target="_blank" class="block shrink-0 rounded-lg overflow-hidden border border-slate-200 w-16 h-12 bg-slate-100 hover:opacity-80 transition" title="Lihat Foto Bukti">
                      <img src="${e.photoProof}" alt="Bukti Surat" class="w-full h-full object-cover" />
                    </a>
                    <div class="text-[11px] text-slate-500">
                      <p class="font-bold text-slate-700">Foto Surat Bukti / Dispensasi Terlampir</p>
                      <a href="${e.photoProof}" target="_blank" class="text-blue-600 hover:underline">Perbesar / Unduh Berkas Bukti ↗</a>
                    </div>
                  </div>
                `:``}
              </div>
            `}).join(``),C.querySelectorAll(`.btn-edit-my-perm`).forEach(e=>{e.addEventListener(`click`,()=>{let n=e.dataset.id,r=t.find(e=>e.id===n);r&&y(r)})}),C.querySelectorAll(`.btn-delete-my-perm`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.id;if(confirm(`Batalkan dan hapus permohonan izin dengan ID ${t}?`))try{(await fetch(`/api/permissions?id=${t}`,{method:`DELETE`})).ok?(await o(),alert(`Permohonan izin berhasil dibatalkan / dihapus.`)):alert(`Gagal membatalkan permohonan izin.`)}catch(e){console.error(`Gagal hapus izin:`,e),alert(`Terjadi kesalahan saat membatalkan izin.`)}})})))}var f=`all`,p=``;function m(){let t=document.getElementById(`guru-permissions-confirm-list`),r=document.getElementById(`badge-guru-pending-count`),i=document.getElementById(`badge-guru-approved-count`);if(!t)return;let a=n.filter(t=>{let n=e.find(e=>e.id===t.studentId);return!n||n.role!==`guru`}),o=a.filter(e=>e.status===`Menunggu`).length,s=a.filter(e=>e.status===`Disetujui`).length;r&&(r.textContent=`${o} Menunggu`,r.className=o>0?`text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl animate-pulse`:`text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl`),i&&(i.textContent=`${s} Disetujui`);let c=a.length,l=a.filter(e=>e.category===`sakit`).length,u=a.filter(e=>e.category===`dispensasi`).length,d=a.filter(e=>e.category===`keluarga`||e.category===`izin`).length,m=document.getElementById(`cat-count-all`),_=document.getElementById(`cat-count-sakit`),v=document.getElementById(`cat-count-dispensasi`),y=document.getElementById(`cat-count-keluarga`);m&&(m.textContent=String(c)),_&&(_.textContent=String(l)),v&&(v.textContent=String(u)),y&&(y.textContent=String(d));let b=p.toLowerCase().trim(),x=a.filter(e=>{let t=f===`all`?!0:f===`keluarga`?e.category===`keluarga`||e.category===`izin`:e.category===f,n=!b||(e.name||``).toLowerCase().includes(b)||(e.title||``).toLowerCase().includes(b)||(e.className||``).toLowerCase().includes(b);return t&&n}).sort((e,t)=>e.status===`Menunggu`&&t.status!==`Menunggu`?-1:e.status!==`Menunggu`&&t.status===`Menunggu`?1:(t.startDate||``).localeCompare(e.startDate||``));x.length===0?t.innerHTML=`
          <div class="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200/80">
            <span class="material-symbols-outlined text-4xl mb-2 text-slate-300 block">inbox</span>
            <p class="text-xs font-semibold text-slate-600">Tidak ada permohonan izin siswa yang sesuai.</p>
            <p class="text-[11px] text-slate-400 mt-1">Coba ubah tab kategori atau kata kunci pencarian di atas.</p>
          </div>
        `:(t.innerHTML=x.map(e=>{let t=e.status===`Menunggu`,n=e.status===`Disetujui`,r=e.status===`Selesai`,i=e.status===`Ditolak`,a=t?`<span class="px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">Menunggu Persetujuan</span>`:n?`<span class="px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">Disetujui Sah</span>`:r?`<span class="px-3 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">Selesai (Arsip)</span>`:`<span class="px-3 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300">Ditolak</span>`,o=t?`border-l-amber-500`:n?`border-l-emerald-500`:r?`border-l-slate-400`:`border-l-rose-500`,s=e.category===`sakit`,c=e.category===`keluarga`||e.category===`izin`,l=s?`from-emerald-500 to-teal-700`:c?`from-indigo-500 to-purple-700`:`from-blue-600 via-indigo-600 to-purple-600`,u=s?`MEDIS`:c?`IZIN`:`DISPENSASI`,d=``;return d=t?`
            <div class="flex items-center gap-2">
              <button type="button" data-action="reject" data-id="${e.id}" class="btn-guru-action-reject px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-1 cursor-pointer">
                <span class="material-symbols-outlined text-sm">cancel</span>
                <span>Tolak</span>
              </button>
              <button type="button" data-action="approve" data-id="${e.id}" class="btn-guru-action-approve px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all duration-200 shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-1 cursor-pointer">
                <span class="material-symbols-outlined text-sm">check_circle</span>
                <span>Setujui</span>
              </button>
            </div>
          `:n?`
            <div class="flex items-center gap-2">
              <span class="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-emerald-700">check_circle</span>
                <span>Disetujui Sah</span>
              </span>
              <button type="button" data-action="reject" data-id="${e.id}" class="btn-guru-action-reject px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-600 border border-slate-200 text-xs font-semibold transition-all duration-200 active:scale-95 flex items-center gap-1 cursor-pointer" title="Batalkan dan ubah status ke Ditolak">
                <span class="material-symbols-outlined text-xs">close</span>
                <span>Tolak</span>
              </button>
            </div>
          `:i?`
            <div class="flex items-center gap-2">
              <span class="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-900 border border-rose-300 text-xs font-bold flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-rose-700">cancel</span>
                <span>Ditolak</span>
              </span>
              <button type="button" data-action="approve" data-id="${e.id}" class="btn-guru-action-approve px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-1 cursor-pointer" title="Ubah status ke Disetujui">
                <span class="material-symbols-outlined text-xs">check_circle</span>
                <span>Setujui</span>
              </button>
            </div>
          `:`
            <div class="flex items-center gap-2">
              <span class="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-slate-500">inventory_2</span>
                <span>Selesai (Arsip)</span>
              </span>
            </div>
          `,`
          <article class="bg-white rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-l-4 ${o} border border-slate-200/70" id="card-perm-${e.id}">
            <div class="flex items-start sm:items-center gap-4">
              <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${l} p-2 text-white flex flex-col items-center justify-center text-center shrink-0 shadow-md">
                <span class="text-[9px] font-black uppercase tracking-wider text-white/90">${u}</span>
                <span class="text-xs font-black mt-0.5">${e.className}</span>
                <span class="text-[9px] text-white/80 font-mono">${e.daysCount||1} HARI</span>
              </div>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h4 class="text-sm sm:text-base font-extrabold text-slate-900">${e.name}</h4>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">${e.className}</span>
                  ${a}
                  ${e.approvedBy?`
                    <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${n?`bg-emerald-50 text-emerald-800 border border-emerald-200`:`bg-rose-50 text-rose-800 border border-rose-200`} flex items-center gap-1">
                      <span class="material-symbols-outlined text-[13px]">${n?`verified`:`cancel`}</span>
                      <span>${n?`Disetujui oleh:`:`Ditolak oleh:`} <strong class="underline decoration-slate-300 underline-offset-2">${e.approvedBy}</strong></span>
                    </span>
                  `:``}
                </div>
                <p class="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1.5 flex-wrap">
                  <span class="material-symbols-outlined text-sm text-blue-600">article</span>
                  <span>${e.title}</span>
                  <span class="text-slate-300">•</span>
                  <span class="text-slate-500 font-normal font-mono text-[11px]">${e.startDate} s/d ${e.endDate||e.startDate}</span>
                </p>
                <div class="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm text-emerald-600">task</span>
                    <span>Lampiran: ${e.attachmentNote||`Surat Permohonan`}</span>
                  </span>
                  ${e.photoProof?`
                    <span class="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                      <span class="material-symbols-outlined text-xs text-blue-600">photo_library</span>
                      <span>Ada Foto Bukti</span>
                    </span>
                  `:``}
                  ${e.approvedAt?`
                    <span class="text-[11px] text-slate-400 font-mono">
                      Waktu: ${new Date(e.approvedAt).toLocaleDateString(`id-ID`,{day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`})} WIB
                    </span>
                  `:``}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end lg:self-center shrink-0">
              <button
                type="button"
                data-id="${e.id}"
                class="btn-guru-view-detail px-3 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-xs font-bold transition-all duration-150 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Lihat foto bukti surat & rincian permohonan siswa"
              >
                <span class="material-symbols-outlined text-sm text-blue-600">visibility</span>
                <span>Foto & Rincian</span>
              </button>
              ${d}
            </div>
          </article>
        `}).join(``),t.querySelectorAll(`.btn-guru-view-detail`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.id,n=a.find(e=>e.id===t);n&&g(n)})}),t.querySelectorAll(`.btn-guru-action-approve`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.id;t&&await h(t,`Disetujui`,e)})}),t.querySelectorAll(`.btn-guru-action-reject`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.id;t&&await h(t,`Ditolak`,e)})}))}async function h(e,t,n){let i=a?.name||r?.name||`Dewan Guru`;n&&(n.disabled=!0);try{(await fetch(`/api/permissions`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({action:`update_status`,id:e,status:t,approvedBy:i})})).ok?(await o(),_(),window.showToast?window.showToast(`Permohonan berhasil ${t===`Disetujui`?`disetujui sah`:`ditolak`} oleh ${i}`,`success`):alert(`Permohonan izin siswa telah ${t===`Disetujui`?`disetujui`:`ditolak`} oleh ${i}!`)):(alert(`Gagal memperbarui status permohonan.`),n&&(n.disabled=!1))}catch(e){console.error(`Error update izin oleh guru:`,e),alert(`Terjadi kesalahan jaringan.`),n&&(n.disabled=!1)}}function g(e){let t=document.getElementById(`modal-guru-detail-izin`);if(!t)return;let n=document.getElementById(`guru-detail-student-name`),r=document.getElementById(`guru-detail-student-class`),i=document.getElementById(`guru-detail-student-id`),a=document.getElementById(`guru-detail-student-avatar`),o=document.getElementById(`guru-detail-status-badge`),s=document.getElementById(`guru-detail-perm-category`),c=document.getElementById(`guru-detail-perm-dates`),l=document.getElementById(`guru-detail-perm-reason`),u=document.getElementById(`guru-detail-perm-attach`),d=document.getElementById(`guru-detail-photo-tag`),f=document.getElementById(`guru-detail-photo-container`),p=document.getElementById(`guru-detail-photo-img`),m=document.getElementById(`guru-detail-photo-link`),g=document.getElementById(`guru-detail-photo-download`),_=document.getElementById(`guru-detail-no-photo`),v=document.getElementById(`guru-detail-approver-box`),y=document.getElementById(`guru-detail-action-buttons-group`);n&&(n.textContent=e.name),r&&(r.textContent=e.className),i&&(i.textContent=e.studentId||e.id),a&&(a.textContent=(e.name||`S`).charAt(0).toUpperCase());let b=e.status===`Menunggu`,x=e.status===`Disetujui`;e.status,o&&(o.innerHTML=b?`<span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">Menunggu Persetujuan</span>`:x?`<span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">Disetujui Sah</span>`:`<span class="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">Ditolak</span>`),s&&(s.innerHTML=`<span class="material-symbols-outlined text-sm text-blue-600">badge</span><span>${e.categoryLabel||(e.category===`sakit`?`Sakit (Medis)`:e.category===`dispensasi`?`Dispensasi (Lomba/PKL)`:`Urusan Keluarga`)}</span>`),c&&(c.textContent=`${e.startDate} s/d ${e.endDate||e.startDate} (${e.daysCount||1} Hari)`),l&&(l.textContent=e.title||`Tidak ada alasan khusus yang dicantumkan.`),u&&(u.textContent=e.attachmentNote||`Surat Permohonan / Keterangan`),e.photoProof?(d&&(d.textContent=`Foto Terlampir`),p&&(p.src=e.photoProof),m&&(m.href=e.photoProof),g&&(g.href=e.photoProof),f&&f.classList.remove(`hidden`),_&&_.classList.add(`hidden`)):(d&&(d.textContent=`Tanpa Berkas`),f&&f.classList.add(`hidden`),_&&_.classList.remove(`hidden`)),v&&(e.approvedBy?(v.className=`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 flex-wrap ${x?`bg-emerald-50/80 border-emerald-200 text-emerald-900`:`bg-rose-50/80 border-rose-200 text-rose-900`}`,v.innerHTML=`
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base ${x?`text-emerald-600`:`text-rose-600`}">${x?`verified`:`cancel`}</span>
              <span>${x?`Permohonan disetujui oleh:`:`Permohonan ditolak oleh:`} <strong class="text-slate-900">${e.approvedBy}</strong></span>
            </div>
            ${e.approvedAt?`<span class="text-[10px] font-normal text-slate-500">${new Date(e.approvedAt).toLocaleDateString(`id-ID`,{day:`numeric`,month:`short`,hour:`2-digit`,minute:`2-digit`})} WIB</span>`:``}
          `,v.classList.remove(`hidden`)):v.classList.add(`hidden`)),y&&(b?(y.innerHTML=`
            <button type="button" id="btn-modal-reject" class="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer">
              <span class="material-symbols-outlined text-sm">cancel</span>
              <span>Tolak Izin</span>
            </button>
            <button type="button" id="btn-modal-approve" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-1 cursor-pointer">
              <span class="material-symbols-outlined text-sm">check_circle</span>
              <span>Setujui Izin</span>
            </button>
          `,document.getElementById(`btn-modal-reject`)?.addEventListener(`click`,()=>h(e.id,`Ditolak`)),document.getElementById(`btn-modal-approve`)?.addEventListener(`click`,()=>h(e.id,`Disetujui`))):x?(y.innerHTML=`
            <button type="button" id="btn-modal-reject" class="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer">
              <span class="material-symbols-outlined text-sm">cancel</span>
              <span>Batalkan & Tolak</span>
            </button>
          `,document.getElementById(`btn-modal-reject`)?.addEventListener(`click`,()=>h(e.id,`Ditolak`))):(y.innerHTML=`
            <button type="button" id="btn-modal-approve" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-1 cursor-pointer">
              <span class="material-symbols-outlined text-sm">check_circle</span>
              <span>Ubah jadi Setujui</span>
            </button>
          `,document.getElementById(`btn-modal-approve`)?.addEventListener(`click`,()=>h(e.id,`Disetujui`)))),t.classList.remove(`hidden`)}function _(){let e=document.getElementById(`modal-guru-detail-izin`);e&&e.classList.add(`hidden`)}function v(){let e=document.querySelectorAll(`.tab-guru-cat`);e.forEach(t=>{t.addEventListener(`click`,()=>{f=t.dataset.cat||`all`,e.forEach(e=>{e.className=e.dataset.cat===f?`tab-guru-cat px-3.5 py-2 rounded-xl text-xs font-bold transition bg-blue-600 text-white shadow-xs cursor-pointer`:`tab-guru-cat px-3.5 py-2 rounded-xl text-xs font-semibold transition bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer`}),m()})});let t=document.getElementById(`search-guru-perm-input`);t&&t.addEventListener(`input`,()=>{p=t.value,m()}),document.getElementById(`btn-close-guru-detail`)?.addEventListener(`click`,_),document.getElementById(`btn-close-guru-detail-footer`)?.addEventListener(`click`,_),document.getElementById(`modal-guru-detail-izin`)?.addEventListener(`click`,e=>{e.target===e.currentTarget&&_()})}function y(e){let t=document.getElementById(`form-izin-edit-id`),n=document.getElementById(`form-izin-category-select`),r=document.getElementById(`form-izin-start-date`),i=document.getElementById(`form-izin-end-date`),a=document.getElementById(`form-izin-reason`),o=document.getElementById(`form-izin-days-text`),s=document.getElementById(`btn-submit-izin-text`),c=document.getElementById(`btn-cancel-edit-izin`),l=document.getElementById(`form-izin-preview-container`),u=document.getElementById(`form-izin-preview-img`);t&&(t.value=e.id),n&&(n.value=e.category||`sakit`),r&&(r.value=e.startDate||``),i&&(i.value=e.endDate||e.startDate||``),a&&(a.value=e.title||``),o&&(o.textContent=`${e.daysCount||1} Hari`);let d=document.getElementById(`cb-jurusan-rpl`),f=document.getElementById(`cb-jurusan-akl`);d&&(d.checked=(e.jurusan||``).includes(`RPL`)),f&&(f.checked=(e.jurusan||``).includes(`AKL`)),e.photoProof&&u&&l?(u.src=e.photoProof,l.style.display=`inline-block`,l.classList.remove(`hidden`)):l&&(l.style.display=`none`,l.classList.add(`hidden`)),s&&(s.textContent=`Perbarui Permohonan Izin`),c&&c.classList.remove(`hidden`);let p=document.querySelector(`[data-target="sec-izin"]`);p&&p.click(),document.getElementById(`sec-izin`)?.scrollIntoView({behavior:`smooth`})}function b(){let e=document.getElementById(`form-izin-edit-id`),t=document.getElementById(`form-izin-reason`),n=document.getElementById(`btn-submit-izin-text`),r=document.getElementById(`btn-cancel-edit-izin`),i=document.getElementById(`form-izin-preview-container`),a=document.getElementById(`form-izin-preview-img`),o=document.getElementById(`form-izin-photo-input`);e&&(e.value=``),t&&(t.value=``),o&&(o.value=``),a&&(a.src=``),i&&(i.style.display=`none`,i.classList.add(`hidden`)),n&&(n.textContent=`Kirim Permohonan Izin`),r&&r.classList.add(`hidden`)}function x(){let e=document.getElementById(`form-izin-start-date`),t=document.getElementById(`form-izin-end-date`),n=document.getElementById(`form-izin-days-text`),i=document.getElementById(`form-izin-photo-input`),a=document.getElementById(`form-izin-preview-container`),s=document.getElementById(`form-izin-preview-img`),c=document.getElementById(`btn-remove-photo-preview`),l=document.getElementById(`btn-cancel-edit-izin`),u=document.getElementById(`form-izin-mandiri`),d=document.getElementById(`form-izin-alert`),f=()=>{if(!e||!t||!n)return;let r=e.value,i=t.value;if(r&&i)try{let e=new Date(r).getTime(),t=new Date(i).getTime(),a=Math.max(1,Math.round((t-e)/864e5)+1);n.textContent=`${a} Hari`}catch{n.textContent=`1 Hari`}};e&&e.addEventListener(`change`,f),t&&t.addEventListener(`change`,f);function p(e,t=800,n=.65){return new Promise(r=>{let i=new FileReader;i.onload=e=>{let i=new Image;i.onload=()=>{let a=i.width,o=i.height;(a>t||o>t)&&(a>o?(o=Math.round(o*t/a),a=t):(a=Math.round(a*t/o),o=t));let s=document.createElement(`canvas`);s.width=a,s.height=o;let c=s.getContext(`2d`);c?(c.drawImage(i,0,0,a,o),r(s.toDataURL(`image/jpeg`,n))):r(e.target?.result||``)},i.onerror=()=>r(e.target?.result||``),i.src=e.target?.result},i.onerror=()=>r(``),i.readAsDataURL(e)})}i&&i.addEventListener(`change`,async()=>{let e=i.files?.[0];if(!e)return;s&&a&&(a.style.display=`inline-block`,a.classList.remove(`hidden`));let t=await p(e,800,.65);s&&(s.src=t)}),c&&c.addEventListener(`click`,()=>{i&&(i.value=``),s&&(s.src=``),a&&(a.style.display=`none`,a.classList.add(`hidden`))}),l&&l.addEventListener(`click`,b);let m=document.getElementById(`btn-open-modal-izin`);m&&m.addEventListener(`click`,()=>{let e=document.querySelector(`[data-target="sec-izin"]`);e&&e.click()}),u&&u.addEventListener(`submit`,async n=>{if(n.preventDefault(),!r)return;let i=r.role===`guru`,a=document.getElementById(`form-izin-edit-id`)?.value||``,c=document.getElementById(`form-izin-category-select`)?.value||`sakit`,l={sakit:`Sakit`,dispensasi:`Dispensasi`,keluarga:`Urusan Keluarga`}[c]||`Izin`,u=e?.value||new Date().toLocaleDateString(`en-CA`,{timeZone:`Asia/Jakarta`}),f=t?.value||u,p=1;try{let e=new Date(u).getTime(),t=new Date(f).getTime();p=Math.max(1,Math.round((t-e)/864e5)+1)}catch{}let m=document.getElementById(`form-izin-reason`)?.value.trim()||`Permohonan Izin`,h=``;if(!i){let e=document.getElementById(`cb-jurusan-rpl`),t=document.getElementById(`cb-jurusan-akl`),n=[];if(e?.checked&&n.push(`RPL`),t?.checked&&n.push(`AKL`),n.length===0){d&&(d.textContent=`Silahkan centang salah satu jurusan (RPL atau AKL)!`,d.classList.remove(`hidden`));return}h=n.join(`, `)}let g=s?.src||``;if(!i&&!a&&(!g||g.trim()===``))d&&(d.textContent=`Siswa wajib mengunggah foto bukti surat izin atau keterangan dokter!`,d.classList.remove(`hidden`));else{d&&d.classList.add(`hidden`);try{if(a){let e=await fetch(`/api/permissions`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({action:`edit`,id:a,category:c,categoryLabel:l,title:m,startDate:u,endDate:f,daysCount:p,jurusan:h,photoProof:g})});if(e.ok)b(),await o(),alert(`Permohonan izin berhasil diperbarui! Status tetap Menunggu Persetujuan.`);else{let t=await e.json().catch(()=>({}));alert(t.message||`Gagal memperbarui permohonan izin.`)}}else(await fetch(`/api/permissions`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({studentId:r.id,name:r.name,className:r.className||(i?`Dewan Guru`:`XII`),category:c,categoryLabel:l,title:m,startDate:u,endDate:f,daysCount:p,status:`Menunggu`,jurusan:h,photoProof:g,attachmentNote:i?`Keterangan Resmi Guru`:g?`Bukti Foto Surat Dokter Terlampir`:`Keterangan`})})).ok?(b(),await o(),alert(`Permohonan izin untuk ${r.name} berhasil diajukan!\nStatus: Menunggu Persetujuan.`)):alert(`Gagal mengirimkan pengajuan izin.`)}catch(e){console.error(`Error simpan izin:`,e),alert(`Terjadi kesalahan jaringan.`)}}})}function S(){let e=document.querySelectorAll(`.profile-nav-btn`),t=document.querySelectorAll(`.profile-mobile-nav-btn`),n=document.querySelectorAll(`.profile-section`);function r(r){e.forEach(e=>{if(e.dataset.target===r){e.classList.add(`bg-white`,`text-blue-900`,`font-bold`,`shadow-lg`,`shadow-blue-950/25`,`border-l-4`,`border-indigo-700`,`translate-x-1`),e.classList.remove(`text-blue-100/80`,`hover:text-white`,`hover:bg-white/15`,`hover:translate-x-0.5`);let t=e.querySelector(`.material-symbols-outlined:last-child`);t&&(t.style.opacity=`1`)}else{e.classList.remove(`bg-white`,`text-blue-900`,`font-bold`,`shadow-lg`,`shadow-blue-950/25`,`border-l-4`,`border-indigo-700`,`translate-x-1`),e.classList.add(`text-blue-100/80`,`hover:text-white`,`hover:bg-white/15`,`hover:translate-x-0.5`);let t=e.querySelector(`.material-symbols-outlined:last-child`);t&&(t.style.opacity=`0.6`)}}),n.forEach(e=>{e.id===r?e.classList.remove(`hidden`):e.classList.add(`hidden`)});let i=document.getElementById(`profile-sliding-pill`),a=Array.from(t).find(e=>e.dataset.target===r);if(a&&i){let e=parseInt(a.dataset.index||`0`,10);i.style.left=`calc(${100/6*e+100/12}% - 18px)`}t.forEach(e=>{let t=e,n=t.dataset.target===r,i=t.querySelector(`.bnav-icon-box`),a=t.querySelector(`.bnav-label`);n?(i&&(i.className=`bnav-icon-box w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 ease-out text-white -translate-y-1.5`),a&&(a.className=`bnav-label text-[10px] tracking-tight leading-tight transition-all duration-200 whitespace-nowrap text-blue-600 font-bold -translate-y-0.5`)):(i&&(i.className=`bnav-icon-box w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 ease-out text-slate-400 group-hover:text-slate-700 translate-y-0`),a&&(a.className=`bnav-label text-[10px] tracking-tight leading-tight transition-all duration-200 whitespace-nowrap text-slate-400 font-medium translate-y-0`))})}e.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.target;t&&r(t)})});let i=[`sec-biodata`,`sec-card`,`sec-timeline`,`sec-poin`,`sec-izin`],a=!1;t.forEach(e=>{e.addEventListener(`click`,t=>{if(a){t.preventDefault();return}let n=e.dataset.target;n&&r(n)})});let o=document.getElementById(`profile-bottom-nav`),s=0,c=0,l=0;o?.addEventListener(`touchstart`,e=>{s=e.touches[0].clientX,c=e.touches[0].clientY,l=Date.now(),a=!1},{passive:!0}),o?.addEventListener(`touchmove`,e=>{let t=Math.abs(e.touches[0].clientX-s),n=Math.abs(e.touches[0].clientY-c);t>8&&t>n&&(a=!0)},{passive:!0}),o?.addEventListener(`touchend`,e=>{let t=s-e.changedTouches[0].clientX;if(Date.now()-l<320&&Math.abs(t)>16||Math.abs(t)>28){let e=Array.from(n).find(e=>!e.classList.contains(`hidden`)),a=e?e.id:`sec-biodata`,o=i.indexOf(a);t>0&&o<i.length-1?r(i[o+1]):t<0&&o>0&&r(i[o-1])}setTimeout(()=>{a=!1},80)},{passive:!0});let u=localStorage.getItem(`auth_role`),d=document.getElementById(`profile-mobile-back-link`),f=document.getElementById(`profile-mobile-logout-btn`);u===`siswa`&&(d&&(d.style.display=`none`),f&&(f.classList.remove(`hidden`),f.classList.add(`flex`),f.onclick=()=>{localStorage.removeItem(`auth_civitas`),localStorage.removeItem(`auth_role`),sessionStorage.removeItem(`auth_active`),sessionStorage.removeItem(`bypass_login`),document.cookie=`auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`,window.location.replace(`/login`)}));let p=new URLSearchParams(window.location.search).get(`tab`)||window.location.hash.replace(`#`,``);p&&r(p.startsWith(`sec-`)?p:`sec-${p}`)}window.addEventListener(`attendance-updated`,o),S(),x(),v(),o();