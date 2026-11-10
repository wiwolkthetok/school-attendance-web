var e=[],t=[],n=`all`,r=``,i=typeof window<`u`&&localStorage.getItem(`auth_role`)||`guru`,a=i===`guru`||i===`admin`,o=document.getElementById(`permissions-list`),s=document.getElementById(`perm-modal`),c=document.getElementById(`btn-open-modal`),l=document.getElementById(`btn-close-modal`),u=document.getElementById(`btn-cancel-modal`),d=document.getElementById(`perm-form`),f=document.getElementById(`perm-student-select`),p=document.getElementById(`search-izin-input`),m=document.getElementById(`btn-cleanup-total`);window.cleanupPermissions=async function(e){e&&e.preventDefault();let t=document.getElementById(`btn-cleanup-total`),n=document.getElementById(`btn-cleanup-text`);if(window.confirm(`Bersihkan / Kosongkan Seluruh Daftar Permohonan Izin?

• Klik [OK] untuk MENGHAPUS SEMUA daftar permohonan izin (reset bersih).
• Klik [Batal] untuk membatalkan.`)){t&&(t.disabled=!0),n&&(n.textContent=`Membersihkan...`);try{let e=await fetch(`/api/permissions`,{method:`DELETE`}),t=await e.json();e.ok?(typeof window.showToast==`function`?window.showToast(t.message||`Seluruh permohonan izin berhasil dibersihkan!`,`success`):alert(t.message||`Seluruh permohonan izin berhasil dibersihkan!`),await h()):alert(`Gagal membersihkan data: `+(t.message||`Error`))}catch(e){console.error(`Error saat pembersihan izin:`,e),alert(`Terjadi kesalahan koneksi ke server.`)}finally{t&&(t.disabled=!1),n&&(n.textContent=`Bersihkan Permohonan`)}}},m?.addEventListener(`click`,e=>window.cleanupPermissions(e));async function h(){try{let[n,r]=await Promise.all([fetch(`/api/permissions`),fetch(`/api/students`)]);e=await n.json(),t=await r.json(),g(),_(),v()}catch(e){console.error(`Gagal memuat data perizinan:`,e)}}function g(){f&&(f.innerHTML=`<option value="">-- Pilih Siswa atau Guru --</option>`+t.filter(e=>!e.className?.toLowerCase().includes(`alumni`)&&!e.className?.toLowerCase().includes(`lulus`)).map(e=>`<option value="${e.id}" data-name="${e.name}" data-class="${e.className}">${e.name} (${e.className})</option>`).join(``))}function _(){let t=e.filter(e=>e.status===`Menunggu`).length,n=e.filter(e=>e.status===`Disetujui`).length,r=e.filter(e=>e.status===`Ditolak`).length,i=e.filter(e=>e.status===`Selesai`).length,a=(e,t)=>{let n=document.getElementById(e);n&&(n.textContent=String(t))};a(`perm-stat-menunggu`,t),a(`perm-stat-disetujui`,n),a(`perm-stat-ditolak`,r+i),a(`count-all`,e.length),a(`count-sakit`,e.filter(e=>e.category===`sakit`).length),a(`count-dispensasi`,e.filter(e=>e.category===`dispensasi`).length),a(`count-keluarga`,e.filter(e=>e.category===`keluarga`).length)}function v(){if(!o)return;let t=e.filter(e=>{let t=n===`all`||e.category===n,i=r.toLowerCase(),a=!i||e.name.toLowerCase().includes(i)||(e.title||``).toLowerCase().includes(i)||(e.className||``).toLowerCase().includes(i);return t&&a});t.length===0?o.innerHTML=`
          <div class="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200/80">
            <span class="material-symbols-outlined text-4xl mb-2 text-slate-300">inbox</span>
            <p class="text-xs font-semibold">Tidak ada permohonan izin / dispensasi yang ditampilkan.</p>
          </div>
        `:(o.innerHTML=t.map(e=>{let t=e.status===`Menunggu`,n=e.status===`Disetujui`,r=e.status===`Selesai`,i=e.status===`Ditolak`,o=t?`<span class="px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">Menunggu Persetujuan</span>`:n?`<span class="px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">Disetujui Sah</span>`:r?`<span class="px-3 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">Selesai (Arsip)</span>`:`<span class="px-3 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300">Ditolak</span>`,s=t?`border-l-amber-500`:n?`border-l-emerald-500`:r?`border-l-slate-400`:`border-l-rose-500`,c=e.category===`sakit`,l=e.category===`keluarga`,u=c?`from-emerald-500 to-teal-700`:l?`from-indigo-500 to-purple-700`:`from-blue-600 via-indigo-600 to-purple-600`,d=c?`MEDIS`:l?`IZIN`:`LKS/PKL`,f=``;return f=a?t?`
              <div class="flex items-center gap-1.5 sm:gap-2">
                <button data-action="reject" data-id="${e.id}" class="btn-action-reject px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[11px] sm:text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-600 active:scale-95 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">cancel</span>
                  <span>Tolak</span>
                </button>
                <button data-action="approve" data-id="${e.id}" class="btn-action-approve px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-bold transition-all duration-200 shadow-md shadow-blue-500/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">check_circle</span>
                  <span>Setujui</span>
                </button>
              </div>
            `:n?`
              <div class="flex items-center gap-1.5 sm:gap-2">
                <span class="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] sm:text-xs font-bold flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm text-emerald-700">check_circle</span>
                  <span>Disetujui</span>
                </span>
                <button data-action="reject" data-id="${e.id}" class="btn-action-reject px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-600 border border-slate-200 text-[11px] sm:text-xs font-semibold transition-all duration-200 active:scale-95 flex items-center gap-1" title="Batalkan dan ubah status ke Ditolak">
                  <span class="material-symbols-outlined text-xs">close</span>
                  <span>Tolak</span>
                </button>
              </div>
            `:i?`
              <div class="flex items-center gap-1.5 sm:gap-2">
                <span class="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-rose-100 text-rose-900 border border-rose-300 text-[11px] sm:text-xs font-bold flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm text-rose-700">cancel</span>
                  <span>Ditolak</span>
                </span>
                <button data-action="approve" data-id="${e.id}" class="btn-action-approve px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] sm:text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-1" title="Ubah status ke Disetujui">
                  <span class="material-symbols-outlined text-xs">check_circle</span>
                  <span>Setujui</span>
                </button>
              </div>
            `:`
              <div class="flex items-center gap-1.5 sm:gap-2">
                <span class="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-300 text-[11px] sm:text-xs font-bold flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm text-slate-500">inventory_2</span>
                  <span>Arsip</span>
                </span>
                <button data-action="approve" data-id="${e.id}" class="btn-action-approve px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] sm:text-xs font-semibold transition-all duration-200 active:scale-95 flex items-center gap-1" title="Buka kembali dan setujui izin ini">
                  <span class="material-symbols-outlined text-xs">check</span>
                  <span>Setujui</span>
                </button>
              </div>
            `:`
            <span class="px-2.5 sm:px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
              ${e.status}
            </span>
          `,`
          <article class="bg-white rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-l-4 ${s} border border-slate-200/70">
            <div class="flex items-start sm:items-center gap-3 sm:gap-4">
              <div class="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${u} p-1.5 sm:p-2 text-white flex flex-col items-center justify-center text-center shrink-0 shadow-md">
                <span class="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white/90">${d}</span>
                <span class="text-[11px] sm:text-xs font-black mt-0.5 truncate max-w-full">${e.className}</span>
                <span class="text-[8px] sm:text-[9px] text-white/80 font-mono">${e.daysCount||1} HARI</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h4 class="text-sm sm:text-base font-extrabold text-slate-900 truncate">${e.name}</h4>
                  <span class="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">${e.className}</span>
                  ${o}
                </div>
                <p class="text-xs font-semibold text-slate-800 mt-1 flex flex-wrap items-center gap-1 sm:gap-1.5">
                  <span class="material-symbols-outlined text-sm text-blue-600 shrink-0">article</span>
                  <span class="break-words">${e.title}</span>
                  <span class="text-slate-300 hidden sm:inline">•</span>
                  <span class="text-slate-500 font-normal font-mono text-[11px] w-full sm:w-auto mt-0.5 sm:mt-0">${e.startDate} s/d ${e.endDate}</span>
                </p>
                <div class="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-slate-500">
                  <span class="flex items-center gap-1 truncate max-w-full">
                    <span class="material-symbols-outlined text-sm text-emerald-600 shrink-0">task</span>
                    <span class="truncate">Lampiran: ${e.attachmentNote||`Surat Permohonan`}</span>
                  </span>
                  ${e.photoProof?`
                    <span class="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg shadow-2xs">
                      <span class="material-symbols-outlined text-xs text-blue-600">photo_library</span>
                      <span>Ada Foto Bukti</span>
                    </span>
                  `:``}
                </div>
              </div>
            </div>
            <div class="w-full lg:w-auto flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-1.5 sm:gap-2 pt-2.5 sm:pt-3 lg:pt-0 border-t border-slate-100 lg:border-0 shrink-0">
              <button
                type="button"
                data-id="${e.id}"
                class="btn-view-detail px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-[11px] sm:text-xs font-bold transition-all duration-150 active:scale-95 flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Lihat foto bukti surat & rincian permohonan siswa"
              >
                <span class="material-symbols-outlined text-sm text-blue-600">visibility</span>
                <span class="whitespace-nowrap">Foto & Rincian</span>
              </button>
              <div class="flex items-center gap-1.5 sm:gap-2">
                ${f}
                <button
                  type="button"
                  data-id="${e.id}"
                  data-name="${e.name}"
                  class="btn-action-delete p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-300 text-xs font-bold transition-all duration-150 active:scale-95 flex items-center justify-center cursor-pointer shadow-2xs"
                  title="Hapus permohonan ini secara permanen"
                >
                  <span class="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          </article>
        `}).join(``),o.querySelectorAll(`.btn-action-approve`).forEach(e=>{e.addEventListener(`click`,()=>w(e.dataset.id,`Disetujui`))}),o.querySelectorAll(`.btn-action-reject`).forEach(e=>{e.addEventListener(`click`,()=>w(e.dataset.id,`Ditolak`))}),o.querySelectorAll(`.btn-action-delete`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.id,n=e.dataset.name||`siswa`;if(t&&confirm(`Hapus permohonan izin dari ${n} secara permanen?`))try{(await fetch(`/api/permissions?id=${t}`,{method:`DELETE`})).ok&&(typeof window.showToast==`function`&&window.showToast(`Permohonan berhasil dihapus!`,`success`),await h())}catch(e){console.error(`Gagal menghapus izin:`,e)}})}),o.querySelectorAll(`.btn-view-detail`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.dataset.id,r=e.find(e=>e.id===n);r&&C(r)})}))}var y=document.getElementById(`detail-perm-modal`),b=document.getElementById(`btn-close-detail-modal`),x=document.getElementById(`btn-close-detail-modal-footer`),S=()=>{y&&(y.classList.add(`hidden`),y.classList.remove(`flex`))};b?.addEventListener(`click`,S),x?.addEventListener(`click`,S);function C(e){if(!y)return;let t=(e,t)=>{let n=document.getElementById(e);n&&(n.textContent=t)};t(`detail-student-avatar`,(e.name||`S`).charAt(0).toUpperCase()),t(`detail-student-name`,e.name||`-`),t(`detail-student-class`,e.className||`-`),t(`detail-student-id`,e.studentId||`-`),t(`detail-perm-category`,e.categoryLabel||e.category||`Izin`),t(`detail-perm-dates`,`${e.startDate} s/d ${e.endDate||e.startDate} (${e.daysCount||1} Hari)`),t(`detail-perm-reason`,e.title||`-`),t(`detail-perm-attach`,e.attachmentNote||`Surat Permohonan`);let n=document.getElementById(`detail-status-badge`);n&&(n.innerHTML=e.status===`Menunggu`?`<span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">Menunggu</span>`:e.status===`Disetujui`?`<span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">Disetujui Sah</span>`:e.status===`Ditolak`?`<span class="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">Ditolak</span>`:`<span class="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">Selesai (Arsip)</span>`);let r=document.getElementById(`detail-photo-container`),i=document.getElementById(`detail-no-photo`),o=document.getElementById(`detail-photo-img`),s=document.getElementById(`detail-photo-link`),c=document.getElementById(`detail-photo-download`),l=document.getElementById(`detail-photo-tag`);e.photoProof&&e.photoProof.trim()!==``?(r&&r.classList.remove(`hidden`),i&&i.classList.add(`hidden`),o&&(o.src=e.photoProof),s&&(s.href=e.photoProof),c&&(c.href=e.photoProof),l&&(l.textContent=`Terlampir`)):(r&&r.classList.add(`hidden`),i&&i.classList.remove(`hidden`),l&&(l.textContent=`Tidak Ada`));let u=document.getElementById(`detail-action-buttons-group`);u&&(a?(u.innerHTML=e.status===`Menunggu`?`
              <button type="button" class="btn-modal-reject px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition flex items-center gap-1 active:scale-95 cursor-pointer">
                <span class="material-symbols-outlined text-sm">cancel</span>
                <span>Tolak</span>
              </button>
              <button type="button" class="btn-modal-approve px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-1 cursor-pointer">
                <span class="material-symbols-outlined text-sm">check_circle</span>
                <span>Setujui Izin</span>
              </button>
            `:e.status===`Disetujui`?`
              <span class="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm text-emerald-700">check_circle</span>
                <span>Disetujui Sah</span>
              </span>
              <button type="button" class="btn-modal-reject px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-600 border border-slate-200 text-xs font-semibold transition active:scale-95 cursor-pointer">
                <span>Ubah ke Tolak</span>
              </button>
            `:`
              <button type="button" class="btn-modal-approve px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md active:scale-95 flex items-center gap-1 cursor-pointer">
                <span class="material-symbols-outlined text-sm">check_circle</span>
                <span>Setujui Sekarang</span>
              </button>
            `,u.querySelector(`.btn-modal-approve`)?.addEventListener(`click`,async()=>{await w(e.id,`Disetujui`),S()}),u.querySelector(`.btn-modal-reject`)?.addEventListener(`click`,async()=>{await w(e.id,`Ditolak`),S()})):u.innerHTML=``),y.classList.remove(`hidden`),y.classList.add(`flex`)}async function w(e,t){try{(await fetch(`/api/permissions`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({action:`update_status`,id:e,status:t})})).ok&&await h()}catch(e){console.error(`Gagal memperbarui status:`,e)}}var T=new Date().toLocaleDateString(`en-CA`,{timeZone:`Asia/Jakarta`}),E=document.getElementById(`perm-start-input`),D=document.getElementById(`perm-end-input`);E&&(E.value=T),D&&(D.value=T),c?.addEventListener(`click`,()=>{s&&(s.classList.remove(`hidden`),s.classList.add(`flex`))});var O=()=>{s&&(s.classList.add(`hidden`),s.classList.remove(`flex`))};l?.addEventListener(`click`,O),u?.addEventListener(`click`,O),d?.addEventListener(`submit`,async e=>{e.preventDefault();let t=f?.options[f.selectedIndex],n=f?.value||``,r=t?.getAttribute(`data-name`)||``,i=t?.getAttribute(`data-class`)||``,a=document.getElementById(`perm-category-select`)?.value||`dispensasi`,o=document.getElementById(`perm-status-select`)?.value||`Disetujui`,s=document.getElementById(`perm-title-input`)?.value||``,c=E?.value||T,l=D?.value||T,u=document.getElementById(`perm-attach-input`)?.value||`Surat Pengantar`,p=new Date(c).getTime(),m=new Date(l).getTime(),g={studentId:n,name:r,className:i,category:a,title:s,startDate:c,endDate:l,daysCount:Math.max(1,Math.round((m-p)/864e5)+1),status:o,attachmentNote:u};try{(await fetch(`/api/permissions`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(g)})).ok&&(O(),d.reset(),E&&(E.value=T),D&&(D.value=T),await h())}catch(e){console.error(`Gagal mengirim formulir:`,e)}}),document.querySelectorAll(`.tab-category`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.tab-category`).forEach(e=>{e.className=`tab-category tab-notch-inactive whitespace-nowrap shrink-0 px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all duration-200 flex items-center gap-1.5 sm:gap-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}),e.className=`tab-category tab-notch-active whitespace-nowrap shrink-0 px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs font-bold text-slate-900 transition-all duration-200 flex items-center gap-1.5 sm:gap-2 focus:outline-none focus:ring-2 focus:ring-blue-600`,n=e.dataset.category||`all`,v()})}),p?.addEventListener(`input`,e=>{r=e.target.value,v()}),window.addEventListener(`attendance-updated`,h),h();