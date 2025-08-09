# Yek Salai Website (Free Running Cost Version)

A comprehensive, free web application for Meitei Yek Salai clan identification, marriage compatibility checking, and cultural preservation. Built with zero ongoing costs using static hosting and local storage.

## 🌟 Features

### 🏛️ Clan Identification System
- **Complete Database**: All 860 surnames across 7 Yek Salai clans
- **Instant Search**: Type any surname to find clan membership
- **Offline Storage**: JSON-based database with no hosting costs
- **Clan Browser**: Browse all clans and their associated surnames

### 💒 Marriage Compatibility Checker
- **Rule Validation**: Checks Yek Tinnaba and Shairuk Tinnaba restrictions
- **Instant Alerts**: Clear warnings for prohibited matches
- **Educational Content**: Explanations of marriage rules and cultural significance
- **Visual Indicators**: Color-coded compatibility results

### 🌳 Genealogy & Family Tree (Lite)
- **Simple Tree Builder**: Add family members manually
- **Local Storage**: All data stored on device (no cloud costs)
- **Photo Support**: Placeholder support for family photos
- **Data Export**: Download family tree data as JSON

### 📚 Educational Modules
- **Meitei History**: Timeline of historical events
- **Interactive Quizzes**: Test knowledge about Yek Salai system
- **Cultural Lessons**: Learn about clan significance and traditions
- **Static Content**: All educational materials built into the app

### 🎨 Modern UI/UX
- **Material Design 3**: Clean, professional interface
- **Dark/Light Themes**: User preference toggle
- **Mobile-First**: Responsive design for all devices
- **Accessibility**: Screen reader friendly and keyboard navigable

## 🚀 Live Demo

**[Try the Yek Salai Website](https://banishwor.github.io/yek-salai-website)**

## 📊 Clan Database

The website includes complete data for all seven Yek Salai:

- **Mangang (Ningthouja)**: 251 surnames - Red clan (ruling clan)
- **Luwang**: 101 surnames - White clan (noon time)
- **Khuman**: 202 surnames - Dark clan (night time)
- **Angom**: 103 surnames - Pink clan (sunshine radiance)
- **Moirang**: 100 surnames - Golden clan (ancient principality)
- **Khaba Nganba**: 41 surnames - Black clan (merged group)
- **Salang Leisangthem**: 62 surnames - Blue clan (also Chenglei)

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Data Storage**: Static JSON files + LocalStorage
- **Styling**: CSS Grid, Flexbox, Custom Properties
- **Hosting**: GitHub Pages (free static hosting)
- **PWA**: Service Worker for offline capability
- **No Dependencies**: Pure vanilla JavaScript

## 📁 Project Structure

```
yek-salai-website/
├── index.html                  # Main HTML file
├── style.css                   # All styles and theming
├── app.js                      # Application logic
├── yek_salai_database.json     # Complete clan database
├── README.md                   # This file
├── LICENSE                     # Apache 2.0 license
└── deployment-guide.md         # Detailed deployment instructions
```

## 🚀 Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/banishwor/yek-salai-website.git
   cd yek-salai-website
   ```

2. **Run locally**
   ```bash
   # Option A: Open index.html directly in browser
   open index.html
   
   # Option B: Use a local server
   python3 -m http.server 8000
   # or
   npx serve .
   ```

3. **View in browser**
   - Direct: Open `index.html` in any modern browser
   - Server: Visit `http://localhost:8000`

### Deployment (GitHub Pages)

1. **Fork or create repository**
2. **Upload all files** to the main branch
3. **Enable GitHub Pages**:
   - Go to repository Settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"
4. **Access your site** at: `https://yourusername.github.io/yek-salai-website`

## 💰 Zero-Cost Architecture

- **No Server Required**: Pure client-side application
- **No Database Hosting**: Static JSON files
- **No Cloud Storage**: LocalStorage for user data
- **Free Hosting**: GitHub Pages, Netlify, or Vercel
- **No API Calls**: All functionality works offline

## 🔒 Privacy & Data

- **Local Storage Only**: Family trees stored on user's device
- **No Analytics**: No tracking or data collection by default
- **No Server Communication**: All processing happens locally
- **User Control**: Full data export/import capability
- **Cultural Sensitivity**: Respectful handling of cultural information

## 🤝 Contributing

Contributions are welcome! Please help improve cultural accuracy, add features, or enhance the user experience.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Guidelines

- Maintain cultural sensitivity and accuracy
- Cite sources for cultural information
- Test on multiple devices and browsers
- Follow existing code style
- Update documentation as needed

## 🗺️ Roadmap

### Version 2.0 (Planned)
- [ ] Advanced genealogy features
- [ ] Multi-language support (Meitei, English)
- [ ] Enhanced offline capabilities
- [ ] Social sharing features
- [ ] Extended quiz modules
- [ ] Historical timeline enhancements

### Future Considerations
- [ ] Flutter mobile app version
- [ ] Advanced family tree visualization
- [ ] Community features
- [ ] Cultural event calendar
- [ ] Extended educational resources

## 🐛 Bug Reports & Feature Requests

Please use GitHub Issues to:
- Report bugs
- Request new features
- Suggest improvements
- Ask questions about usage

## 📜 Cultural Note

This application is designed to preserve and share Meitei cultural heritage. While it provides guidance on clan identification and marriage compatibility, users are encouraged to consult with knowledgeable community elders and cultural authorities for important decisions.

## 🏆 Acknowledgments

- Meitei cultural communities for preserving this knowledge
- Contributors who help maintain cultural accuracy
- Open source community for tools and inspiration

## 📞 Contact

- **Author**: Banishwor Athokpam
- **GitHub**: [@banishwor](https://github.com/banishwor)
- **Project Issues**: [GitHub Issues](https://github.com/banishwor/yek-salai-website/issues)

## 📄 License

This project is licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) file for details.

## ⚖️ Disclaimer

This tool is provided for cultural education and basic guidance. For sensitive family or cultural decisions, please consult knowledgeable community elders and authorities. The accuracy of cultural information is maintained to the best of our ability, but users should verify important details with authoritative sources.

---

**Made with ❤️ for Meitei cultural preservation**