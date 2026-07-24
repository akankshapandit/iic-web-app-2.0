import React from "react";
import { motion } from "framer-motion";

// AY 2024-25
import mantahnWinner from "../../assets/achievements/AY_2024-25/manthan state level business plan winner 2025.png";
import sihWinner from "../../assets/achievements/AY_2024-25/SIH 2024 Winner.png";

import msme1 from "../../assets/achievements/AY_2024-25/msme_hack_4.0/msme_idea_hackathon_4.0_1.png";
import msme2 from "../../assets/achievements/AY_2024-25/msme_hack_4.0/msme_idea_hackathon_4.0_2.png";
import msme3 from "../../assets/achievements/AY_2024-25/msme_hack_4.0/msme_idea_hackathon_4.0_3.png";
import msme4 from "../../assets/achievements/AY_2024-25/msme_hack_4.0/msme_idea_hackathon_4.0_4.png";

import srishti2 from "../../assets/achievements/AY_2024-25/srishti_winners/srishti_winners 2.png";

// AY 2023-24
import manthan2324 from "../../assets/achievements/AY_2023-24/manthan_23-24.png";
import yuvaka1 from "../../assets/achievements/AY_2023-24/yuvaka_sangha/yuvaka_1.png";
import yuvaka2 from "../../assets/achievements/AY_2023-24/yuvaka_sangha/yuvaka_2.png";
import yuvaka3 from "../../assets/achievements/AY_2023-24/yuvaka_sangha/yuvaka_3.png";
import yuvaka4 from "../../assets/achievements/AY_2023-24/yuvaka_sangha/yuvaka_4.png";

// AY 2022-23
import sih2022 from "../../assets/achievements/AY_2022-23/SIH_2022.png";
import manthan2022 from "../../assets/achievements/AY_2022-23/manthan_2022.png";

// AY 2021-22
import innovationAmbassadorAdvanced from "../../assets/achievements/AY_2021-22/innov_ambad_adv.png";
import innovationAmbassadorFoundation from "../../assets/achievements/AY_2021-22/innov_ambad_found.png";
import manthan2021Water from "../../assets/achievements/AY_2021-22/fkcci_manthan_2021_water_level.png";
import manthan2021Books from "../../assets/achievements/AY_2021-22/fkcci_manthan_2021_books_games.png";
import swachhtaPakwada from "../../assets/achievements/AY_2021-22/swachhta_pakwada.png";

// AY 2020-21
import naturalBioEntrepreneurship from "../../assets/achievements/AY_2020-21/2020_natural_bio_enterpreunership.png";
import aaaiInfotechStartup from "../../assets/achievements/AY_2020-21/aaai.infotech_startup.png";
import chhatraVishwakarma from "../../assets/achievements/AY_2020-21/chhatra_vishvakarma award 2020.png";

// AY 2019-20
import sih2019 from "../../assets/achievements/AY_2019-20/SIH_2019.png";
import studentDesignComp2019 from "../../assets/achievements/AY_2019-20/student_design_comp_2019.png";

// AY 2018-19
import sih2018 from "../../assets/achievements/AY_2018-19/SIH_18.png";
import accelathon1 from "../../assets/achievements/AY_2018-19/accelathon.png";
import accelathon2 from "../../assets/achievements/AY_2018-19/accleathon_2.0_first_runner.png";
import veganarke from "../../assets/achievements/AY_2018-19/veganarke.png";
import mistGen2018 from "../../assets/achievements/AY_2018-19/mist_gen_2018.png";
import massMosquito2018 from "../../assets/achievements/AY_2018-19/mass_mosquito_2018.png";
import fkcciManthan2018 from "../../assets/achievements/AY_2018-19/fkcci_manthan_2018.png";
import polymerComposite2018 from "../../assets/achievements/AY_2018-19/polymer_composite_2018.png";
import seaSand2018 from "../../assets/achievements/AY_2018-19/sea_sand_2018.png";

function Achievements() {
  const achievements202425 = [
    {
      title: "MANTAHN State Level Business Plan Winner 2025",
      year: "AY 2024–25",
      category: "Business Plan",
      info: "Grand Finale recognition under student achievements.",
      layout: "singleLarge",
      images: [mantahnWinner],
    },
    {
      title: "SIH Winner 2024",
      year: "AY 2024–25",
      category: "Hackathon",
      info: "Smart India Hackathon winning team achievement.",
      layout: "singleLarge",
      images: [sihWinner],
    },
    {
      title: "MSME IDEA Hackathon 4.0 (Youth) Grant for Students",
      year: "AY 2024–25",
      category: "Grant / Funding",
      info: "4 student teams from CMRIT have been awarded ₹15 Lakhs each (Total ₹60 Lakhs) by MSME, Govt. of India.",
      layout: "quad",
      images: [msme1, msme2, msme3, msme4],
    },
    {
      title: "Srishti Innovation Exchange - May 2025",
      year: "AY 2024–25",
      category: "Innovation Exchange",
      info: "Project Idea Title: Vridh-Raksha: Smart Fall Detection",
      extra: "SRISHTI Winners 2025",
      layout: "singleLarge",
      images: [srishti2],
    },
  ];

  const achievements202324 = [
    {
      title: "Students Winning in MANTHAN-2024",
      year: "AY 2023–24",
      category: "Business Plan",
      info: "Student team recognition in MANTHAN-2024.",
      layout: "singleTall",
      images: [manthan2324],
    },
    {
      title: "Winners of Yuvaka Sangha's Incubation Support Program - 2024",
      year: "AY 2023–24",
      category: "Incubation Support",
      info: "Selected student teams under Yuvaka Sangha's Incubation Support Program.",
      layout: "quad",
      images: [yuvaka1, yuvaka2, yuvaka3, yuvaka4],
    },
  ];

  const achievements202223 = [
    {
      title: "Students Winning in SIH-2022",
      year: "AY 2022–23",
      category: "Hackathon",
      info: "Student team recognition in Smart India Hackathon 2022.",
      layout: "singleMedium",
      images: [sih2022],
    },
    {
      title: "Students Winning in MANTHAN-2023",
      year: "AY 2022–23",
      category: "Business Plan",
      info: "Student team recognition in MANTHAN-2023.",
      layout: "singleMedium",
      images: [manthan2022],
    },
  ];

  const achievements202122 = [
    {
      title: "Innovation Ambassador Training Program",
      year: "AY 2021–22",
      category: "Faculty Development / Innovation",
      info: "CMRIT faculty members successfully completed the Innovation Ambassador Training Program of the Ministry of Education's Innovation Cell and AICTE through IIC-CMRIT. The recognition includes both Advanced Level and Foundation Level completions.",
      layout: "double",
      images: [innovationAmbassadorAdvanced, innovationAmbassadorFoundation],
    },
    {
      title: "FKCCI MANTHAN-2021",
      year: "AY 2021–22",
      category: "Business Plan",
      info: "Title: Game changing Application to monitor the water level scenario across the country",
      detailLines: [
        "Received Cash Prize: Rs. 25,000/-",
        "Team Members:",
        "Pratik Mukesh Bharuka (6th CSE),",
        "Vaishnavi Patil (6th Sem CSE),",
        "Yashwanth Jain (6th CSE),",
        "Arpan Abhishek (6th CSE)",
        "Mentor: Prof. Vivia John",
      ],
      layout: "infoCard",
      images: [manthan2021Water],
    },
    {
      title: "FKCCI MANTHAN-2021",
      year: "AY 2021–22",
      category: "Business Plan",
      info: "Title: Books & Games with Purpose",
      detailLines: [
        "Received Cash Prize: Rs. 15,000/-",
        "Team Members:",
        "Vidhyashree V (7th sem MECH),",
        "S Swetha Shree (6th Sem CSE)",
        "Mentor: Prof. Phani Kumar Pullela",
      ],
      layout: "infoCard",
      images: [manthan2021Books],
    },
    {
      title: "RailBin",
      year: "AY 2021–22",
      category: "Competition / Innovation",
      info: "Won Swachhata Pakhwada Competition 2021 and received Cash Prize Rs. 5000/-",
      detailLines: [
        "Team Members:",
        "Maiank Sri Singh (4th Sem EEE),",
        "Prajwal Babu (4th Sem EEE),",
        "Uday Kiran Chintala (4th sem EEE)",
        "Mentor: Dr. V. Agalya",
      ],
      layout: "infoCard",
      images: [swachhtaPakwada],
    },
  ];

  const achievements202021 = [
    {
      title: "AICTE Chhatra Vishwakarma Award 2020",
      year: "AY 2020–21",
      category: "National Level Achievement",
      info: "Title: UV Sanitization Chamber",
      detailLines: [
        "Team Members:",
        "Swethashree (CSE),",
        "Nitish Stujan (Civil),",
        "Zain Ahmed (CSE), Rahul Mahendrakar (CSE),",
        "Amrutha CK (CSE)",
        "Faculty Mentor:",
        "Kodandapani D (EEE)",
      ],
      layout: "infoCard",
      images: [chhatraVishwakarma],
    },
    {
      title: "National Bio Entrepreneurship Competition 2020",
      year: "AY 2020–21",
      category: "Innovation Achievement",
      info: "Heartiest Congratulations on being selected as Innovators of the Future from National Bio Entrepreneurship Competition 2020 and winning a cash prize of Rs. 5 Lakhs.",
      layout: "singleMedium",
      images: [naturalBioEntrepreneurship],
    },
    {
      title: "Startup Founded – AAAI.Infotech",
      year: "AY 2020–21",
      category: "Student Startup",
      info: "Mr. Saswat Pandey, Mr. Pratik Kumar Mishra, Ms. Shraddha Sahay and Mr. Kunal Shekhar set their start-up 'AAAI.Infotech' in the first year of engineering.",
      layout: "singleMedium",
      images: [aaaiInfotechStartup],
    },
  ];

  const achievements201920 = [
    {
      title: "Smart India Hackathon 2019",
      year: "AY 2019–20",
      category: "National Hackathon",
      info: "CMRIT students achieved recognition at the Grand Finale of Smart India Hackathon 2019, showcasing innovation and problem-solving at a national level.",
      layout: "singleLarge",
      images: [sih2019],
    },
    {
      title: "50th All India Student Design Competition - 2019",
      year: "AY 2019–20",
      category: "Student Design Achievement",
      info: "National Design and Research Forum selected Pramitha Soans for awarding GOLD MEDAL IN ELECTRICAL ENGINEERING DISCIPLINE.",
      layout: "infoCard",
      detailLines: [
        "Institution of Engineers (India)",
        "Rajasthan State Centre, Gandhi Nagar,",
        "Tonk Road, Jaipur 302015",
      ],
      images: [studentDesignComp2019],
    },
  ];

  const achievements201819 = [
    {
      title: "Smart India Hackathon 2018",
      year: "AY 2018–19",
      category: "National Hackathon",
      layout: "singleLarge",
      images: [sih2018],
    },
    {
      title: "Accelathon 2.0 – First Runners",
      year: "AY 2018–19",
      category: "Innovation Competition",
      layout: "singleLarge",
      images: [accelathon2],
    },
    {
      title: "Veganarke Startup",
      year: "AY 2018–19",
      category: "Student Entrepreneurship",
      layout: "imageText",
      image: veganarke,
      description:
        "Abhay Rangan started his plant-based dairy alternatives company Veganarke with his mother in their home kitchen and traveled long distances every week to deliver products. Today the startup ships nationwide with strong investor support.",
      link: "https://sites.google.com/cmrit.ac.in/innovation-entrepreneurship-ce/entrepreneurs-of-cmrit",
    },
    {
      title: "Ideas for India 2018",
      year: "AY 2018–19",
      category: "Innovation Award",
      info: "Universe Health, Education and Environmental Trust - Ideas for India 2018",
      detailLines: [
        "1st Prize: Mist generation based particulate matter removal from air (Rs 4000)",
        "Anup Gowda, Nithish Kumar, Allen Welwin",
      ],
      layout: "infoCard",
      images: [mistGen2018],
    },
    {
      title: "Ideas for India 2018",
      year: "AY 2018–19",
      category: "Innovation Award",
      info: "Universe Health, Education and Environmental Trust - Ideas for India 2018",
      detailLines: [
        "2nd Prize: Mass mosquito destroyer (Rs 3000)",
        "Tanish T, Mayur S, Karthik K",
      ],
      layout: "infoCard",
      images: [massMosquito2018],
    },
    {
      title: "FKCCI Manthan 2018",
      year: "AY 2018–19",
      category: "Green Initiative Award",
      info: "Green Initiative Award at FKCCI Manthan 2018",
      detailLines: [
        "Cash Prize: Rs 25,000/-",
        "For sewage treatment & Bellandur lake cleaning project",
        "Team:",
        "Abhinab Mishra, Hitesh Bhalotia,",
        "Souptik Mukherjee, Sharath Kumar D",
      ],
      layout: "infoCard",
      images: [fkcciManthan2018],
    },
    {
      title: "Ideas for India 2018",
      year: "AY 2018–19",
      category: "Innovation Award",
      info: "Universe Health, Education and Environmental Trust - Ideas for India 2018",
      detailLines: [
        "2nd Prize: Polymer composite based flex banner recycling (Rs 3000)",
        "Chetan T, Reshma R Rao, Amurutha K, Shilpa R, Swati R",
      ],
      layout: "infoCard",
      images: [polymerComposite2018],
    },
    {
      title: "Ideas for India 2018",
      year: "AY 2018–19",
      category: "Innovation Award",
      info: "Universe Health, Education and Environmental Trust - Ideas for India 2018",
      detailLines: [
        "2nd Prize: Utilization of sea sand for construction (Rs 3000)",
        "Nithesh Reddy, Koushik N, Tanish T",
      ],
      layout: "infoCard",
      images: [seaSand2018],
    },
  ];

  const Badge = ({ children }) => (
    <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold">
      {children}
    </span>
  );

  const SectionTitle = ({ title, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-10"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-blue-800">{title}</h2>
      <p className="mt-2 text-slate-600 text-lg">{subtitle}</p>
    </motion.div>
  );

  const renderAchievementCard = (item, index) => (
    <motion.div
      key={`${item.year}-${item.title}-${index}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl p-5"
    >
      <div className="mb-4">
        <div className="flex gap-2 mb-3 flex-wrap">
          <Badge>{item.year}</Badge>
          <Badge>{item.category}</Badge>
        </div>

        <h3 className="text-xl font-bold text-slate-800">{item.title}</h3>

        {item.info && (
          <p className="mt-2 text-slate-600 text-sm leading-relaxed">
            {item.info}
          </p>
        )}
      </div>

      {item.layout === "singleLarge" && (
        <div className="overflow-hidden rounded-2xl shadow-md">
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-72 md:h-80 object-cover"
          />
        </div>
      )}

      {item.layout === "singleTall" && (
        <div className="overflow-hidden rounded-2xl shadow-md">
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-[315px] md:h-[360px] object-cover"
          />
        </div>
      )}

      {item.layout === "singleMedium" && (
        <div className="overflow-hidden rounded-2xl shadow-md">
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-64 md:h-72 object-cover"
          />
        </div>
      )}

      {item.layout === "double" && (
        <div className="grid md:grid-cols-2 gap-4">
          {item.images.map((img, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl shadow-md border border-slate-200"
            >
              <img
                src={img}
                alt={`${item.title} ${i + 1}`}
                className="w-full h-64 md:h-72 object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {item.layout === "quad" && (
        <div className="grid grid-cols-2 gap-3">
          {item.images.map((img, i) => (
            <div
              key={i}
              className="w-full h-36 md:h-40 lg:h-44 overflow-hidden rounded-xl shadow"
            >
              <img
                src={img}
                alt={`${item.title} ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {item.layout === "infoCard" && (
        <div className="grid md:grid-cols-2 gap-5 items-start">
          <div className="overflow-hidden rounded-2xl shadow-md">
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-full h-64 md:h-72 object-cover"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-slate-800 font-medium leading-relaxed">
              {item.info}
            </p>

            {item.detailLines && (
              <div className="mt-4 space-y-2">
                {item.detailLines.map((line, idx) => (
                  <p
                    key={idx}
                    className={`text-sm leading-relaxed ${
                      line.includes("Team:") ||
                      line.includes("Team Members:") ||
                      line.includes("Faculty Mentor:") ||
                      line.includes("Mentor:") ||
                      line.includes("Cash Prize") ||
                      line.includes("1st Prize") ||
                      line.includes("2nd Prize")
                        ? "font-semibold text-slate-800"
                        : "text-slate-600"
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {item.layout === "imageText" && (
        <div className="grid md:grid-cols-2 gap-5 items-start">
          <div className="overflow-hidden rounded-2xl shadow-md">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-64 md:h-72 object-cover"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between h-full">
            <p className="text-slate-700 text-sm leading-relaxed">
              {item.description}
            </p>

            <div className="mt-4">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 font-medium hover:underline"
              >
                Read more →
              </a>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 md:px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800">
            Student Achievements
          </h1>
        </motion.div>

        <section className="mb-20">
          <SectionTitle
            title="Academic Year 2024–25"
            subtitle="Student achievements, awards, grants and innovation recognitions"
          />
          <div className="grid lg:grid-cols-2 gap-8">
            {achievements202425.map(renderAchievementCard)}
          </div>
        </section>

        <section className="mb-20">
          <SectionTitle
            title="Academic Year 2023–24"
            subtitle="Student achievements and incubation recognitions"
          />
          <div className="grid lg:grid-cols-2 gap-8">
            {achievements202324.map(renderAchievementCard)}
          </div>
        </section>

        <section className="mb-20">
          <SectionTitle
            title="Academic Year 2022–23"
            subtitle="Student achievements and competition recognitions"
          />
          <div className="grid lg:grid-cols-2 gap-8">
            {achievements202223.map(renderAchievementCard)}
          </div>
        </section>

        <section className="mb-20">
          <SectionTitle
            title="Academic Year 2021–22"
            subtitle="Innovation training, competition awards and student recognitions"
          />
          <div className="grid lg:grid-cols-2 gap-8">
            {achievements202122.map(renderAchievementCard)}
          </div>
        </section>

        <section className="mb-20">
          <SectionTitle
            title="Academic Year 2020–21"
            subtitle="National awards, entrepreneurship recognitions and student startup achievements"
          />
          <div className="grid lg:grid-cols-2 gap-8">
            {achievements202021.map(renderAchievementCard)}
          </div>
        </section>

        <section className="mb-20">
          <SectionTitle
            title="Academic Year 2019–20"
            subtitle="National level student achievements and design recognitions"
          />
          <div className="grid lg:grid-cols-2 gap-8">
            {achievements201920.map(renderAchievementCard)}
          </div>
        </section>

        <section>
          <SectionTitle
            title="Academic Year 2018–19"
            subtitle="Hackathons, innovation awards and early student entrepreneurship recognitions"
          />
          <div className="grid lg:grid-cols-2 gap-8">
            {achievements201819.map(renderAchievementCard)}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Achievements;