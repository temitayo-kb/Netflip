// import React from "react";
// import "./Footer.css";
// import youtube_icon from "../../assets/youtube_icon.png";
// import twitter_icon from "../../assets/twitter_icon.png";
// import instagram_icon from "../../assets/instagram_icon.png";
// import facebook_icon from "../../assets/facebook_icon.png";

// const Footer = () => {
//   return (
//     <div className="footer">
//       <div className="footer-icons">
//         <img src={facebook_icon} alt="" />
//         <img src={instagram_icon} alt="" />
//         <img src={twitter_icon} alt="" />
//         <img src={youtube_icon} alt="" />
//       </div>
//       <ul>
//         <li>Audio Description</li>
//         <li>Help Center</li>
//         <li>Gift Cards</li>
//         <li>Media Center</li>
//         <li>Investor Relations</li>
//         <li>Jobs</li>
//         <li>Terms of Use</li>
//         <li>Privacy</li>
//         <li>Legal Notices</li>
//         <li>Cookie Preferences</li>
//         <li>Corporate Information</li>
//         <li>Contact Us</li>
//       </ul>
//       <p className="copyright text">&copy; 2001-2026 Netflip, Inc.</p>
//     </div>
//   );
// };

// export default Footer;

import React, { useState } from "react";
import "./Footer.css";
import youtube_icon from "../../assets/youtube_icon.png";
import twitter_icon from "../../assets/twitter_icon.png";
import instagram_icon from "../../assets/instagram_icon.png";
import facebook_icon from "../../assets/facebook_icon.png";
import wander from "../../assets/wander.svg";
import WanderModal from "../WanderModal/WanderModal";

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="footer">
      <div className="footer-icons">
        <img
          src={facebook_icon}
          alt="Facebook"
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        />
        <img
          src={instagram_icon}
          alt="Instagram"
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        />
        <img
          src={twitter_icon}
          alt="Twitter"
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        />
        <img
          src={youtube_icon}
          alt="YouTube"
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        />
      </div>
      <ul>
        <li onClick={handleClick}>Audio Description</li>
        <li onClick={handleClick}>Help Center</li>
        <li onClick={handleClick}>Gift Cards</li>
        <li onClick={handleClick}>Media Center</li>
        <li onClick={handleClick}>Investor Relations</li>
        <li onClick={handleClick}>Jobs</li>
        <li onClick={handleClick}>Terms of Use</li>
        <li onClick={handleClick}>Privacy</li>
        <li onClick={handleClick}>Legal Notices</li>
        <li onClick={handleClick}>Cookie Preferences</li>
        <li onClick={handleClick}>Corporate Information</li>
        <li onClick={handleClick}>Contact Us</li>
      </ul>
      <p className="copyright text">&copy; 2001-2026 Netflip, Inc.</p>

      <WanderModal
        isOpen={isModalOpen}
        onClose={handleClose}
        illustration={wander}
      />
    </div>
  );
};

export default Footer;
