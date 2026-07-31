import iecellImage from "../../assets/iecell/iecell.png";


function IECellHome() {

  return (
    <div className="bg-gray-50 min-h-screen">


      {/* PAGE TITLE */}

      <section className="bg-blue-900 text-white py-10">

        <h1
          className="
            text-4xl
            md:text-5xl
            font-bold
            text-center
          "
        >
          CMRIT - Innovation and Entrepreneurship Cell
        </h1>

      </section>




      {/* ABOUT SECTION */}

      <section className="
        max-w-7xl
        mx-auto
        px-8
        py-12
      ">


        <div className="
          grid
          md:grid-cols-3
          gap-10
          items-start
        ">


          {/* LEFT CONTENT */}

          <div className="md:col-span-2">


            <h2 className="
              text-3xl
              font-bold
              text-blue-900
              mb-6
            ">
              CMRIT - I&E
            </h2>



            <p className="
              text-gray-700
              leading-8
              text-lg
              text-justify
            ">

              The Institution Innovation Council (IIC) is an initiative by
              the Government of India, under the support of the Ministry of
              Education, to foster innovation and entrepreneurship among
              students and faculty members in higher education institutions
              across the country.

              <br /><br />

              This program aims to acquaint faculty members with the
              objectives, functioning, and opportunities provided by the
              Institution Innovation Council.

            </p>



            <p className="
              mt-8
              text-gray-700
              leading-8
              text-lg
              text-justify
            ">

              To foster the culture of Innovation and Entrepreneurship in
              CMRIT, all the newly joined faculty members have to undergo
              the following Training programs under two major categories.

            </p>


          </div>





          {/* RIGHT IMAGE */}

          <div className="
            flex
            justify-center
          ">

            <img
              src={iecellImage}
              alt="CMRIT Innovation and Entrepreneurship Cell"
              className="
                rounded-2xl
                shadow-xl
                w-full
                h-[420px]
                object-cover
              "
            />

          </div>


        </div>


      </section>







      {/* TRAINING PROGRAMS */}

      <section className="
        max-w-6xl
        mx-auto
        px-8
        pb-12
      ">



        {/* CATEGORY 1 */}

        <div className="
          bg-white
          shadow-lg
          rounded-2xl
          p-8
        ">


          <h3 className="
            text-xl
            font-bold
            text-blue-800
            mb-4
          ">

            1. I&E Training for the new faculties as part of the Faculty
            Induction Program

          </h3>



          <ol className="
            list-decimal
            ml-6
            space-y-2
            text-gray-700
          ">

            <li>
              IPR and Patent Drafting Workshop
            </li>

            <li>
              Design Thinking and Design Registration Workshop
            </li>

            <li>
              Start-up Training Program
            </li>

          </ol>


        </div>







        {/* CATEGORY 2 */}

        <div className="
          mt-6
          bg-white
          shadow-lg
          rounded-2xl
          p-8
        ">


          <h3 className="
            text-xl
            font-bold
            text-blue-800
            mb-4
          ">

            2. I&E Training for faculty members who are joining as I&E Member

          </h3>




          <ol className="
            list-decimal
            ml-6
            space-y-2
            text-gray-700
          ">


            <li>
              Certifications in NPTEL MOOC courses, related to Innovation
              and Entrepreneurship (I&E)
            </li>


            <li>
              Innovation Ambassador (IA) Training
            </li>


          </ol>


        </div>








        {/* FINAL INFORMATION */}


        <div className="
          mt-8
          bg-blue-50
          border-l-4
          border-blue-700
          p-6
          rounded-lg
        ">


          <p className="
            text-gray-700
            leading-8
            text-justify
          ">

            The new I&E members must undergo both Category 1 as well as
            Category 2 training. However, the non-I&E members can take part
            only in Category 1 training.

            <br /><br />

            These trainings are conducted at the beginning of every
            academic year for all the new faculties of CMRIT.

            These trainings are conducted in the CMRIT campus by the trained
            and certified I&E members from the college.

          </p>


        </div>


      </section>


    </div>
  );
}


export default IECellHome;