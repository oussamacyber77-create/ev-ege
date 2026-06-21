import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabase, supabase as supabaseAdmin } from "@/lib/supabase-server"

const seedWorks = [
  {
    slug: "tarhal-the-big-show",
    client: "وزارة الثقافة",
    title: "ترحال: العرض الأضخم",
    service: "التحويل و الأداء",
    sector: "القطاع الحكومي",
    year: "2025",
    img: "/work/tarhal.png",
    description: "استراتيجية أداء لتحويل العرض المسرحي \"ترحال\" إلى وجهة ثقافية رئيسية، عبر خلق دافع زيارة مباشر يركز على ضخامة الحدث.",
    challenge: "كيف نجذب الجمهور لفعالية ثقافية ذات طابع عالمي.",
    solution: "تطوير استراتيجية أداء تقوم على خلق سبب زيارة واضح ومباشر: هذا هو العرض الأضخم في المنطقة.",
    result: "خلق زيارات مستمرة ومبيعات تذاكر للفعالية طوال فترة إقامتها.",
  },
  {
    slug: "balagh-yamna-makhatir",
    client: "وزارة البلديات والإسكان",
    title: "بلاغك يمنع مخاطر",
    service: "الإبداع",
    sector: "القطاع الحكومي",
    year: "2025",
    img: "/work/balagh.png",
    description: "حملة توعوية لتحفيز الإبلاغ عن التخزين غير المرخص داخل الأحياء السكنية عبر تطبيق «بلدي»، لرفع مستوى الامتثال وسلامة المدن.",
    challenge: "",
    solution: "",
    result: "",
  },
  {
    slug: "sifr-boudra-nadec",
    client: "نادك",
    title: "صفر بودرة",
    service: "الإبداع",
    sector: "الأغذية والمشروبات",
    year: "2024",
    img: "/work/sifr.png",
    description: "إعادة تموضع لحليب نادك طويل الأجل عبر تصميم ملصق يبرز القيمة التنافسية \"صفر بودرة\" بشكل مباشر ومكثف.",
    challenge: "تسليط الضوء على المنتج في سوق يزدحم بالمنافسين.",
    solution: "التركيز على القيمة الأفضل في المنتج والتعبير عنها ببساطة من خلال ملصق يعكس تميز المنتج.",
    result: "خلق ميزة تنافسية واضحة ومباشرة للمنتج في قطاع التجزئة.",
  },
  {
    slug: "mawsim-hasadiha",
    client: "وزارة البيئة والمياه والزراعة",
    title: "موسم حصادها",
    service: "الإبداع",
    sector: "القطاع الحكومي",
    year: "2024",
    img: "/work/mawsim.png",
    description: "حملة ترويجية لزيادة الوعي بالمحاصيل الزراعية المحلية في موسم حصادها وإبراز قيمتها الغذائية.",
    challenge: "",
    solution: "",
    result: "",
  },
  {
    slug: "dhalak-maak-bestshield",
    client: "بست شيلد",
    title: "ظلك معك",
    service: "التحويل و الأداء",
    sector: "التقنية والتجارة الإلكترونية",
    year: "2024",
    img: "/work/dhalak.png",
    description: "حملة أداء وتحويل استثمرت حرارة الصيف لتقديم تظليل السيارات كحل يرافق السائق، لتجاوز عناء البحث عن المواقف المظللة.",
    challenge: "إقناع الجمهور بتركيب التظليل وتحويل هذا الاهتمام إلى مبيعات فعلية.",
    solution: "التعاون مع شخصيات مشهورة لتقديم قيمة مضافة واضحة: في حر الرياض، لا تبحث عن الظل والمواقف المظللة، مع بست شيلد ظلك معك.",
    result: "تحقيق مستهدفات التحويل والمبيعات.",
  },
  {
    slug: "hayya-bil-qisas",
    client: "شركة الدرعية",
    title: "حيّة بالقصص",
    service: "الإبداع",
    sector: "الوجهات والأماكن",
    year: "2024",
    img: "/work/hayya.png",
    description: "حملة للترويج للتجارب العائلية في حي الطريف التاريخي من خلال إحياء القصص التراثية.",
    challenge: "",
    solution: "",
    result: "",
  },
  {
    slug: "mafsal-sah-thobi",
    client: "ثوبي",
    title: "مفصل صح",
    service: "الإبداع",
    sector: "التقنية والتجارة الإلكترونية",
    year: "2024",
    img: "/work/mfassal.png",
    description: "حملة ترويجية لتطبيق ثوبي بمشاركة ياسر القحطاني، لربط دقة تفصيل الثوب باهتمامات الجمهور الرياضية.",
    challenge: "",
    solution: "",
    result: "",
  },
  {
    slug: "idrak-ramadan",
    client: "جمعية إنسان",
    title: "أَدرِك",
    service: "الإبداع",
    sector: "القطاع غير الربحي",
    year: "2024",
    img: "/work/adrik.png",
    description: "حملة تبرعات رمضانية تركز على الأثر العائد على المتبرع نفسه، لخلق دافع شخصي ومباشر للتبرع.",
    challenge: "",
    solution: "",
    result: "",
  },
  {
    slug: "maybeelah-kalam-dkh",
    client: "دخون (DKH)",
    title: "مايبيله كلام",
    service: "الإبداع",
    sector: "الأغذية والمشروبات",
    year: "2023",
    img: "/work/maybeelah.png",
    description: "حملة لترويج عرض تجاري استثنائي لدخون بصياغة تعتمد على الصمت، للتأكيد على أن العرض يتحدث عن نفسه.",
    challenge: "",
    solution: "",
    result: "",
  },
  {
    slug: "yelo-bin-zikri",
    client: "يلو",
    title: "اشتراك يغنيك",
    service: "الإنتاج السينمائي",
    sector: "الأغذية والمشروبات",
    year: "",
    img: "/work/ishtirak.png",
    description: "إنتاج سينمائي يبرز قيمة الاشتراك ومزاياه بأسلوب جذّاب.",
    challenge: "",
    solution: "",
    result: "",
  },
  {
    slug: "yelo-founding-day",
    client: "يلو",
    title: "دروب الفخر",
    service: "الإنتاج السينمائي",
    sector: "الأغذية والمشروبات",
    year: "",
    img: "/work/duroob.png",
    description: "فيلم يحتفي بقيم الفخر والانتماء عبر سرد بصري مؤثر.",
    challenge: "",
    solution: "",
    result: "",
  },
  {
    slug: "brsk-new-ice-coffee",
    client: "برسك",
    title: "قهوة توديك كورشفيل",
    service: "الإبداع",
    sector: "الأغذية والمشروبات",
    year: "2024",
    img: "/work/qahwa.png",
    description: "حملة تربط تجربة القهوة بأجواء السفر والفخامة.",
    challenge: "",
    solution: "",
    result: "",
  },
]

const featuredSlugs = ["amanat-riyadh", "power", "tu"]

const newWorks = [
  {
    slug: "amanat-riyadh",
    client: "امانة الرياض",
    title: "امانة الرياض",
    service: "عرض تقديمي",
    sector: "القطاع الحكومي",
    year: "2025",
    img: "/placeholder.jpg",
    description: "عرض تقديمي احترافي يجمع بين الهوية البصرية المميزة والسرد البصري الإبداعي.",
    challenge: "",
    solution: "",
    result: "",
    images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
    deliverables: ["هوية بصرية", "تصميم عرض", "سرد بصري"],
  },
  {
    slug: "power",
    client: "باور",
    title: "باور",
    service: "تطبيق جوال",
    sector: "التقنية والتجارة الإلكترونية",
    year: "2025",
    img: "/placeholder.jpg",
    description: "تطبيق جوال بتجربة مستخدم سلسة وتصميم عصري يعكس قوة العلامة.",
    challenge: "",
    solution: "",
    result: "",
    images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
    deliverables: ["تصميم واجهات", "تجربة مستخدم", "هوية بصرية"],
  },
  {
    slug: "tu",
    client: "تي يو",
    title: "تي يو",
    service: "منصة رقمية",
    sector: "التعليم",
    year: "2025",
    img: "/placeholder.jpg",
    description: "منصة تعليمية متكاملة تقدم تجربة تعلم تفاعلية تجمع بين المحتوى الأكاديمي المتميز والتصميم البصري الجذاب. صممت هوية المنصة وواجهات الاستخدام لتكون سلسة وملهمة للمتعلمين من جميع الفئات.",
    challenge: "",
    solution: "",
    result: "",
    images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
    deliverables: ["هوية بصرية", "تصميم واجهات", "منصة رقمية"],
  },
]

export async function POST() {
  const hash = await bcrypt.hash("ahmed@osama21129950", 12)

  const { error: adminError } = await supabaseAdmin
    .from("admin")
    .upsert({ id: 1, password_hash: hash }, { onConflict: "id" })

  if (adminError) {
    return NextResponse.json({ error: "فشل إعداد كلمة السر: " + adminError.message }, { status: 500 })
  }

  const allWorks = [...seedWorks, ...newWorks]

  for (const w of allWorks) {
    const images = (w as Record<string, unknown>).images as string[] | undefined
    const deliverables = (w as Record<string, unknown>).deliverables as string[] | undefined

    const { data: work, error } = await supabaseAdmin
      .from("works")
      .insert({
        slug: w.slug,
        client: w.client,
        title: w.title,
        service: w.service,
        sector: w.sector,
        year: w.year || "",
        description: w.description,
        challenge: w.challenge || "",
        solution: w.solution || "",
        result: w.result || "",
        hidden: false,
        featured: featuredSlugs.includes(w.slug),
        banner: images?.[0] || w.img || "",
      })
      .select()
      .single()

    if (error) {
      console.error(`Error inserting ${w.slug}:`, error.message)
      continue
    }

    if (images?.length) {
      await supabaseAdmin.from("work_images").insert(
        images.map((url: string, i: number) => ({
          work_id: work.id,
          url,
          sort_order: i,
        }))
      )
    }

    if (deliverables?.length) {
      await supabaseAdmin.from("work_deliverables").insert(
        deliverables.map((name: string, i: number) => ({
          work_id: work.id,
          name,
          sort_order: i,
        }))
      )
    }
  }

  return NextResponse.json({ success: true, count: allWorks.length })
}
