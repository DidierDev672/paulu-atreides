import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

pdfMake.addVirtualFileSystem(pdfFonts)

export default pdfMake
